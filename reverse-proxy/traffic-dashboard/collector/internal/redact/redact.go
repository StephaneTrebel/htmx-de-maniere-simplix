package redact

import (
	"encoding/json"
	"strings"

	"traffic-dashboard/internal/model"
)

const redacted = "[REDACTED]"

func Apply(e *model.Event, headers []string, fields []string) {
	redactHeaders(e.Request.Headers, headers)
	redactHeaders(e.Response.Headers, headers)
	if len(fields) > 0 {
		e.Request.Body = redactJSONFields(e.Request.Body, fields)
		e.Response.Body = redactJSONFields(e.Response.Body, fields)
	}
}

func redactHeaders(h map[string]string, names []string) {
	for k := range h {
		for _, name := range names {
			if strings.EqualFold(k, name) {
				h[k] = redacted
			}
		}
	}
}

func redactJSONFields(body string, fields []string) string {
	var m map[string]any
	if err := json.Unmarshal([]byte(body), &m); err != nil {
		return body
	}
	changed := false
	for _, f := range fields {
		if _, ok := m[f]; ok {
			m[f] = redacted
			changed = true
		}
	}
	if !changed {
		return body
	}
	b, err := json.Marshal(m)
	if err != nil {
		return body
	}
	return string(b)
}
