package handlers

import (
	"conduit-hda/internal/api"
	"conduit-hda/internal/templates"
	"math"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// ArticlesHandler gère GET /hda/articles.
//
// Query params :
//   - tab  : "global" (défaut) ou "tag"
//   - tag  : nom du tag filtré (utilisé quand tab=tag)
//   - page : numéro de page 1-indexé (défaut 1)
//
// Retourne le fragment HTML complet du fil d'articles : tabs + liste + pagination.
// Le fragment est auto-rafraîchissant : chaque bouton de pagination et chaque onglet
// contient un hx-get qui recharge ce même fragment avec les nouveaux paramètres.
func ArticlesHandler(c echo.Context) error {
	tab := c.QueryParam("tab")
	if tab == "" {
		tab = "global"
	}

	tag := c.QueryParam("tag")

	page := 1
	if p := c.QueryParam("page"); p != "" {
		if n, err := strconv.Atoi(p); err == nil && n > 0 {
			page = n
		}
	}

	// Si tab=tag mais aucun tag fourni, on bascule sur global.
	if tab == "tag" && tag == "" {
		tab = "global"
	}

	client := api.New("")
	articles, total, err := client.GetArticles(page, tag)
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
	component := templates.ArticleFeed(articles, tab, tag, page, totalPages)
	return component.Render(c.Request().Context(), c.Response().Writer)
}
