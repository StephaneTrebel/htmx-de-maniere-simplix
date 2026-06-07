# CLAUDE.md (updated)

## Project Overview

Build a **Traefik middleware-based demo system in Go** designed for conference talks, live demos, and workshops.

This is **not** an observability platform and **not** a production tool.

The goal is to visually demonstrate HTTP traffic flowing through Traefik during live presentations, especially to show progressive migration from SPA architectures to HTMX/HPA architectures.

Example use case:

```text
Browser
   ↓
Traefik
   ├── SPA backend
   └── HTMX/HPA backend
```

The audience should immediately understand:

* which route was called
* which Traefik service handled it
* whether the response is JSON or HTML
* how HTMX differs from SPA APIs
* how routing evolves during migration

---

## Design Principles

### Storytelling First

Do not build a generic observability tool.

Do not compete with browser DevTools.

The UI is optimized for:

* projector readability
* architectural clarity
* routing visualization
* payload comprehension

This is a **live API storytelling tool**, not a monitoring system.

---

### Demo-Only Assumptions

Assume:

* local environments
* very low traffic
* conference talks
* workshops
* development demos

No production concerns.

Therefore:

* in-memory storage only (ring buffer)
* no persistence
* no clustering
* no auth
* no metrics backend
* no OpenTelemetry

Keep it intentionally simple.

---

## Core Architecture (IMPORTANT)

### :warning: Traefik Plugin Limitation

A Traefik middleware plugin:

* is NOT a server
* cannot expose HTTP endpoints
* cannot serve SSE or UI
* cannot behave as a standalone backend service
* only intercepts request/response in the proxy pipeline

Therefore:

> The plugin is a **telemetry ingestion hook**, not the UI backend.

---

## Correct System Architecture

```text
                ┌────────────────────┐
                │  Traefik Plugin    │
                │ (request capture)   │
                └─────────┬──────────┘
                          │ events
                          ▼
                ┌────────────────────┐
                │ Go Collector       │
                │ - ring buffer      │
                │ - filtering        │
                │ - state mgmt       │
                └─────────┬──────────┘
                          │ SSE / API
                          ▼
                ┌────────────────────┐
                │ Web UI (HTMX)      │
                │ + templ + PicoCSS  │
                └────────────────────┘
```

---

## Core Features

### Capture Requests

* timestamp
* method
* path
* query string
* headers
* body (truncated configurable)

### Capture Responses

* status code
* headers
* body (truncated configurable)
* duration

### Capture Traefik Metadata

* router name
* service name
* middleware name

---

## Supported Protocols

### Supported

* HTTP
* HTTPS (terminated by Traefik)

### Not supported

* WebSockets
* SSE passthrough (handled only by collector, not plugin)
* gRPC
* HTTP/3 streaming

---

## Body Handling

Bodies are essential for storytelling.

Used to demonstrate:

### SPA style

```http
GET /api/users
```

```json
{ "users": [...] }
```

### HTMX style

```http
GET /users
HX-Request: true
```

```html
<tbody>...</tbody>
```

---

### Limits

```yaml
maxBodySize: 32768
```

Truncated output:

```text
... truncated (32KB limit)
```

---

## UI Stack (IMPORTANT)

The UI is intentionally minimal and server-driven.

### Frontend stack:

* **templ (Go HTML templates)**
* **HTMX**
* **SSE (HTMX SSE extension)**
* **PicoCSS**
* optional: Highlight.js (payload rendering)

### Why this stack:

* no SPA complexity
* server-rendered UI fits demo storytelling
* HTMX enables incremental updates
* SSE provides live stream of traffic
* PicoCSS ensures readable projector UI

---

## UI Design

### Three-Pane Layout

```text
┌────────────┬────────────┬──────────────┐
│ Timeline   │ Routing    │ Payload      │
├────────────┼────────────┼──────────────┤
│ GET /users │ users-hpa  │ <table>...</ │
│ GET /api   │ users-spa  │ { ... }      │
│ POST /user │ users-hpa  │ <tr>...</tr> │
└────────────┴────────────┴──────────────┘
```

---

### Timeline

* chronological list of requests
* clickable entries (HTMX-driven)

Example:

```text
14:03:12 GET /users
14:03:18 POST /users
14:03:22 GET /api/users
```

---

### Routing Panel

Shows:

* router
* service
* middleware
* status
* duration

This is a **core storytelling element**.

---

### Payload Panel

Displays:

* request body
* response body
* syntax highlighting (JSON / HTML / text)

---

## Visual Cues

The UI must be readable from a distance.

### Content type badges:

* HTMX (`HX-Request: true`) → purple
* HTML → green
* JSON → blue
* JS → yellow
* CSS → teal
* IMG → grey-blue
* FONT → dark purple
* TEXT → dark grey

### Status codes:

* 2xx → green
* 3xx → blue
* 4xx → orange
* 5xx → red

---

## Filtering

Must support:

* route (prefix, e.g. `/hda/`)
* service (exact, case-insensitive, e.g. `hda`)
* content type: `htmx`, `html`, `json`, `js`, `css`, `img`, `font`, `text`
* status code (exact, e.g. `200`, `404`)

Filtering is handled by Go collector + HTMX UI updates.

Note: `htmx` matches requests with `HX-Request: true` regardless of content type. `html` matches HTML responses that are NOT HTMX requests. `text` is a catch-all for plain text that doesn't match any other type.

---

## Core Backend (Go Collector)

This is the **real backend system**.

### Responsibilities:

* receive events from Traefik plugin
* store in ring buffer (in-memory)
* expose HTTP API
* expose SSE stream
* apply filters
* manage UI state

---

### Event Model

```go
type Event struct {
    Timestamp time.Time

    Router     string
    Service    string
    Middleware string

    Request  RequestInfo
    Response ResponseInfo
}
```

---

### RequestInfo

```go
type RequestInfo struct {
    Method  string
    Path    string
    Query   string
    Headers map[string]string
    Body    string

    IsHTMX bool
}
```

---

## SSE Streaming

The Go collector exposes:

```text
GET /events (SSE)
```

Event format:

```text
event: request
data: { ...json... }
```

Used by HTMX SSE extension:

```html
<div
  hx-ext="sse"
  sse-connect="/events"
  sse-swap="event">
</div>
```

---

## Storage

* ring buffer (fixed size)
* in-memory only
* no persistence
* no database

---

## Security

Even for demos:

* redact sensitive headers:

```yaml
redactHeaders:
  - Authorization
  - Cookie
  - Set-Cookie
```

* redact JSON fields:

```yaml
redactFields:
  - password
  - token
  - secret
```

---

## Non-Goals

Do NOT implement:

* distributed tracing
* observability dashboards
* metrics systems
* persistence
* authentication
* production concerns
* OpenTelemetry

---

## Success Criteria

A conference attendee should instantly understand:

1. which route was called
2. which service handled it
3. JSON vs HTML difference
4. HTMX vs SPA distinction
5. routing evolution during migration

If that is achieved, the project is successful.