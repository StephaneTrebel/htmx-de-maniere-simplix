package model

import "time"

type Event struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`

	Router     string `json:"router"`
	Service    string `json:"service"`
	Middleware string `json:"middleware"`

	Request  RequestInfo  `json:"request"`
	Response ResponseInfo `json:"response"`
}

type RequestInfo struct {
	Method  string            `json:"method"`
	Path    string            `json:"path"`
	Query   string            `json:"query"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
	IsHTMX  bool              `json:"isHTMX"`
}

type ResponseInfo struct {
	StatusCode  int               `json:"statusCode"`
	Headers     map[string]string `json:"headers"`
	Body        string            `json:"body"`
	DurationMS  int64             `json:"durationMs"`
	ContentType string            `json:"contentType"`
}
