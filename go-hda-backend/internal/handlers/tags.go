package handlers

import (
	"conduit-hda/internal/api"
	"conduit-hda/internal/templates"

	"github.com/labstack/echo/v4"
)

// TagsHandler gère GET /hda/tags.
// Retourne le fragment HTML du sidebar "Popular Tags".
func TagsHandler(c echo.Context) error {
	client := api.New("")
	tags, err := client.GetTags()
	if err != nil {
		tags = []string{}
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	component := templates.TagsSidebar(tags)
	return component.Render(c.Request().Context(), c.Response().Writer)
}
