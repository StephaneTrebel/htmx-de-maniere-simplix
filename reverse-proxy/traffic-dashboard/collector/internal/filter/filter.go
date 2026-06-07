package filter

import (
	"strings"

	"traffic-dashboard/internal/model"
)

type Params struct {
	Route       string
	Service     string
	ContentType string // "json", "html", "htmx", "js", "css", "img", "font", "text", or empty for all
	StatusCode  int    // 0 = any
}

func Apply(events []*model.Event, p Params) []*model.Event {
	if p.Route == "" && p.Service == "" && p.ContentType == "" && p.StatusCode == 0 {
		return events
	}
	result := make([]*model.Event, 0, len(events))
	for _, e := range events {
		if matches(e, p) {
			result = append(result, e)
		}
	}
	return result
}

func matches(e *model.Event, p Params) bool {
	if p.Route != "" && !strings.HasPrefix(e.Request.Path, p.Route) {
		return false
	}
	if p.Service != "" && !strings.EqualFold(e.Service, p.Service) {
		return false
	}
	if p.StatusCode > 0 && e.Response.StatusCode != p.StatusCode {
		return false
	}
	if p.ContentType != "" {
		ct := strings.ToLower(e.Response.ContentType)
		switch p.ContentType {
		case "htmx":
			if !e.Request.IsHTMX {
				return false
			}
		case "json":
			if !strings.Contains(ct, "json") {
				return false
			}
		case "html":
			if e.Request.IsHTMX || !strings.Contains(ct, "html") {
				return false
			}
		case "js":
			if !strings.Contains(ct, "javascript") {
				return false
			}
		case "css":
			if !strings.Contains(ct, "css") {
				return false
			}
		case "img":
			if !strings.HasPrefix(ct, "image/") {
				return false
			}
		case "font":
			if !strings.HasPrefix(ct, "font/") && !strings.Contains(ct, "font") {
				return false
			}
		case "text":
			if strings.Contains(ct, "json") || strings.Contains(ct, "html") ||
				strings.Contains(ct, "javascript") || strings.Contains(ct, "css") ||
				strings.HasPrefix(ct, "image/") || strings.HasPrefix(ct, "font/") ||
				strings.Contains(ct, "font") {
				return false
			}
		}
	}
	return true
}
