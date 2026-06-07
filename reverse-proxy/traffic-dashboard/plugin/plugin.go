// Package trafficcapture is a Traefik middleware plugin that captures HTTP
// request/response metadata and forwards it to the traffic-dashboard collector.
//
// Constraints:
//   - stdlib only (Yaegi interpreter, no external deps)
//   - no goroutines (Yaegi limitation in some Traefik versions)
//   - POST to collector is synchronous with a short timeout
package trafficcapture

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Config holds the plugin configuration, populated from Traefik labels.
type Config struct {
	CollectorURL string `json:"collectorURL"`
	MaxBodySize  int    `json:"maxBodySize"`
	RouterName   string `json:"routerName"`
	ServiceName  string `json:"serviceName"`
}

// CreateConfig returns the default plugin configuration.
func CreateConfig() *Config {
	return &Config{
		CollectorURL: "http://traffic-dashboard:8765",
		MaxBodySize:  32768,
	}
}

// TrafficCapture is the middleware handler.
type TrafficCapture struct {
	next   http.Handler
	config *Config
	name   string
	client *http.Client
}

// New creates a new TrafficCapture middleware instance.
func New(_ context.Context, next http.Handler, config *Config, name string) (http.Handler, error) {
	if config.CollectorURL == "" {
		return nil, fmt.Errorf("trafficcapture: collectorURL is required")
	}
	if config.MaxBodySize <= 0 {
		config.MaxBodySize = 32768
	}
	return &TrafficCapture{
		next:   next,
		config: config,
		name:   name,
		client: &http.Client{Timeout: 500 * time.Millisecond},
	}, nil
}

// ServeHTTP intercepts the request, forwards it, then sends captured data to the collector.
func (tc *TrafficCapture) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	start := time.Now()

	// Capture request body (restore it so the upstream can still read it).
	reqBody := tc.readBody(req.Body)
	req.Body = io.NopCloser(bytes.NewBuffer(reqBody))

	// Remove Accept-Encoding so the backend serves plain (uncompressed) responses.
	// This is intentional for a demo tool: readable bodies matter more than transfer efficiency.
	req.Header.Del("Accept-Encoding")

	// Wrap the ResponseWriter to capture the response.
	capture := &responseCapture{
		ResponseWriter: rw,
		statusCode:     200,
		maxSize:        tc.config.MaxBodySize,
	}

	tc.next.ServeHTTP(capture, req)

	durationMS := time.Since(start).Milliseconds()

	router := tc.config.RouterName
	if router == "" {
		router = tc.name
	}
	service := tc.config.ServiceName
	if service == "" {
		service = tc.name
	}
	event := buildEvent(req, reqBody, capture, durationMS, tc.name, router, service)
	tc.sendEvent(event)
}

func (tc *TrafficCapture) readBody(body io.ReadCloser) []byte {
	if body == nil {
		return nil
	}
	defer body.Close()
	limited := io.LimitReader(body, int64(tc.config.MaxBodySize))
	b, _ := io.ReadAll(limited)
	return b
}

func (tc *TrafficCapture) sendEvent(event map[string]interface{}) {
	data, err := json.Marshal(event)
	if err != nil {
		return
	}
	url := tc.config.CollectorURL + "/ingest"
	resp, err := tc.client.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return
	}
	resp.Body.Close()
}

// buildEvent constructs the Event payload sent to the collector.
func buildEvent(
	req *http.Request,
	reqBody []byte,
	capture *responseCapture,
	durationMS int64,
	middlewareName string,
	router string,
	service string,
) map[string]interface{} {

	// Build a unique ID from timestamp + method + path.
	id := fmt.Sprintf("%d-%s-%s", time.Now().UnixNano(), req.Method, req.URL.Path)

	reqHeaders := headerMap(req.Header)
	respHeaders := headerMap(capture.Header())
	contentType := capture.Header().Get("Content-Type")
	contentEncoding := capture.Header().Get("Content-Encoding")

	responseBody := safeBody(capture.body.String(), contentType, contentEncoding)

	return map[string]interface{}{
		"id":         id,
		"timestamp":  time.Now().UTC().Format(time.RFC3339Nano),
		"router":     router,
		"service":    service,
		"middleware": middlewareName,
		"request": map[string]interface{}{
			"method":  req.Method,
			"path":    req.URL.Path,
			"query":   req.URL.RawQuery,
			"headers": reqHeaders,
			"body":    string(reqBody),
			"isHTMX":  req.Header.Get("HX-Request") == "true",
		},
		"response": map[string]interface{}{
			"statusCode":  capture.statusCode,
			"headers":     respHeaders,
			"body":        responseBody,
			"durationMs":  durationMS,
			"contentType": contentType,
		},
	}
}

// safeBody returns a placeholder when the body is binary or content-encoded.
func safeBody(body, contentType, contentEncoding string) string {
	enc := strings.ToLower(contentEncoding)
	if enc == "gzip" || enc == "br" || enc == "deflate" || enc == "zstd" {
		return "[" + contentEncoding + " encoded — not displayed]"
	}
	ct := strings.ToLower(contentType)
	if strings.HasPrefix(ct, "image/") ||
		strings.HasPrefix(ct, "font/") ||
		strings.Contains(ct, "font") ||
		strings.Contains(ct, "octet-stream") ||
		strings.Contains(ct, "pdf") ||
		strings.Contains(ct, "zip") {
		return "[binary content — not displayed]"
	}
	return body
}

func headerMap(h http.Header) map[string]string {
	m := make(map[string]string, len(h))
	for k, v := range h {
		m[k] = strings.Join(v, ", ")
	}
	return m
}

// responseCapture wraps http.ResponseWriter to buffer the response body.
type responseCapture struct {
	http.ResponseWriter
	statusCode int
	body       bytes.Buffer
	maxSize    int
}

func (rc *responseCapture) WriteHeader(code int) {
	rc.statusCode = code
	rc.ResponseWriter.WriteHeader(code)
}

func (rc *responseCapture) Write(b []byte) (int, error) {
	if rc.body.Len() < rc.maxSize {
		remaining := rc.maxSize - rc.body.Len()
		if len(b) > remaining {
			rc.body.Write(b[:remaining])
		} else {
			rc.body.Write(b)
		}
	}
	return rc.ResponseWriter.Write(b)
}
