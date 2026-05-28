package handlers

import (
	"conduit-hda/internal/api"
	"conduit-hda/internal/templates"
	"math"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// ProfileArticlesHandler gère GET /hda/profile/articles.
//
// Query params :
//   - username : nom d'utilisateur du profil (obligatoire)
//   - type     : "author" (défaut) ou "favorited"
//   - page     : numéro de page 1-indexé (défaut 1)
//
// Retourne le fragment HTML des articles d'un profil : tabs + liste + pagination.
// Même pattern auto-rafraîchissant que ArticlesHandler (step-02), appliqué à la page Profile.
func ProfileArticlesHandler(c echo.Context) error {
	username := c.QueryParam("username")
	if username == "" {
		return c.String(http.StatusBadRequest, "username is required")
	}

	articleType := c.QueryParam("type")
	if articleType != "author" && articleType != "favorited" {
		articleType = "author"
	}

	page := 1
	if p := c.QueryParam("page"); p != "" {
		if n, err := strconv.Atoi(p); err == nil && n > 0 {
			page = n
		}
	}

	client := api.New("")
	articles, total, err := client.GetProfileArticles(page, username, articleType)
	if err != nil {
		articles = []api.Article{}
		total = 0
	}

	totalPages := int(math.Ceil(float64(total) / float64(api.ArticlePageLimit)))
	if totalPages < 1 {
		totalPages = 1
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	c.Response().WriteHeader(http.StatusOK)
	component := templates.ProfileArticlesFeed(articles, username, articleType, page, totalPages)
	return component.Render(c.Request().Context(), c.Response().Writer)
}
