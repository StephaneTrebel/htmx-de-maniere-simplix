package server

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"traffic-dashboard/internal/config"
	"traffic-dashboard/internal/filter"
	"traffic-dashboard/internal/model"
	"traffic-dashboard/internal/redact"
	"traffic-dashboard/internal/sse"
	"traffic-dashboard/internal/store"
	"traffic-dashboard/internal/templates"
)

type Server struct {
	echo   *echo.Echo
	rb     *store.RingBuffer
	broker *sse.Broker
	cfg    config.Config
}

func New(cfg config.Config) *Server {
	e := echo.New()
	e.HideBanner = true
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	s := &Server{
		echo:   e,
		rb:     store.NewRingBuffer(cfg.BufferSize),
		broker: sse.NewBroker(),
		cfg:    cfg,
	}
	s.registerRoutes()
	return s
}

func (s *Server) Start() error {
	return s.echo.Start(s.cfg.ListenAddr)
}

func (s *Server) registerRoutes() {
	s.echo.GET("/", s.handleIndex)
	s.echo.GET("/events", s.handleSSE)
	s.echo.POST("/ingest", s.handleIngest)
	s.echo.GET("/api/events", s.handleAPIEvents)
	s.echo.GET("/ui/event/:id", s.handleUIEvent)
	s.echo.GET("/ui/timeline", s.handleUITimeline)
	s.echo.POST("/ui/clear", s.handleUIClear)
}

// handleIndex serves the full dashboard page.
func (s *Server) handleIndex(c echo.Context) error {
	events := s.rb.All()
	return renderTempl(c, templates.Index(events))
}

// handleSSE streams new events as HTML fragments to connected browsers.
func (s *Server) handleSSE(c echo.Context) error {
	c.Response().Header().Set("Content-Type", "text/event-stream")
	c.Response().Header().Set("Cache-Control", "no-cache")
	c.Response().Header().Set("Connection", "keep-alive")
	c.Response().Header().Set("X-Accel-Buffering", "no")
	c.Response().WriteHeader(http.StatusOK)
	c.Response().Flush()

	ch := s.broker.Subscribe()
	defer s.broker.Unsubscribe(ch)

	done := c.Request().Context().Done()
	for {
		select {
		case <-done:
			return nil
		case msg, ok := <-ch:
			if !ok {
				return nil
			}
			fmt.Fprint(c.Response(), msg)
			c.Response().Flush()
		}
	}
}

// handleIngest receives an Event from the Traefik plugin.
func (s *Server) handleIngest(c echo.Context) error {
	var e model.Event
	if err := json.NewDecoder(c.Request().Body).Decode(&e); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	redact.Apply(&e, s.cfg.RedactHeaders, s.cfg.RedactFields)
	s.rb.Push(&e)

	// Render the timeline row to HTML and broadcast via SSE.
	var buf bytes.Buffer
	if err := templates.EventRow(&e).Render(context.Background(), &buf); err == nil {
		s.broker.Publish(fmt.Sprintf("event: newRequest\ndata: %s\n\n", buf.String()))
	}
	return c.NoContent(http.StatusNoContent)
}

// handleAPIEvents returns filtered events as JSON.
func (s *Server) handleAPIEvents(c echo.Context) error {
	statusCode := 0
	fmt.Sscanf(c.QueryParam("statusCode"), "%d", &statusCode)
	params := filter.Params{
		Route:       c.QueryParam("route"),
		Service:     c.QueryParam("service"),
		ContentType: c.QueryParam("contentType"),
		StatusCode:  statusCode,
	}
	events := filter.Apply(s.rb.All(), params)
	return c.JSON(http.StatusOK, events)
}

// handleUIEvent returns the routing + payload panels for a given event ID.
func (s *Server) handleUIEvent(c echo.Context) error {
	e := s.rb.GetByID(c.Param("id"))
	if e == nil {
		return c.String(http.StatusNotFound, "event not found")
	}
	return renderTempl(c, templates.DetailPanels(e))
}

// handleUIClear clears the ring buffer and returns an empty timeline + reset detail (OOB).
func (s *Server) handleUIClear(c echo.Context) error {
	s.rb.Clear()

	// Render EmptyDetail to use as OOB content for #detail-container.
	var oob bytes.Buffer
	if err := templates.EmptyDetail().Render(c.Request().Context(), &oob); err != nil {
		oob.Reset()
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	// Primary content (empty) replaces #timeline-list innerHTML.
	// OOB div resets #detail-container to the empty-state placeholder.
	return c.String(http.StatusOK,
		`<div id="detail-container" hx-swap-oob="innerHTML">`+oob.String()+`</div>`,
	)
}

// handleUITimeline returns a filtered timeline list (used by filter form).
func (s *Server) handleUITimeline(c echo.Context) error {
	statusCode := 0
	fmt.Sscanf(c.QueryParam("statusCode"), "%d", &statusCode)
	params := filter.Params{
		Route:       c.QueryParam("route"),
		Service:     c.QueryParam("service"),
		ContentType: c.QueryParam("contentType"),
		StatusCode:  statusCode,
	}
	events := filter.Apply(s.rb.All(), params)
	return renderTempl(c, templates.TimelineList(events))
}

func renderTempl(c echo.Context, component templ.Component) error {
	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	return component.Render(c.Request().Context(), c.Response())
}
