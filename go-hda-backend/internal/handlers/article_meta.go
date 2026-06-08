package handlers

import (
	"conduit-hda/internal/api"
	"conduit-hda/internal/templates"
	"net/http"

	"github.com/a-h/templ"
	"github.com/labstack/echo/v4"
)

type articleMetaClient interface {
	GetArticle(slug string) (api.Article, error)
	FavoriteArticle(slug string) error
	UnfavoriteArticle(slug string) error
	DeleteArticle(slug string) error
	FollowProfile(username string) error
	UnfollowProfile(username string) error
}

var newArticleMetaClient = func(token string) articleMetaClient {
	return api.New(token)
}

func ArticleMetaHandler(c echo.Context) error {
	slug := c.Param("slug")
	if slug == "" {
		return c.String(http.StatusBadRequest, "slug is required")
	}

	client := newArticleMetaClient(tokenFromRequest(c))
	article, err := client.GetArticle(slug)
	if err != nil {
		return c.String(http.StatusBadGateway, "error fetching article")
	}

	return renderArticleMeta(c, templates.ArticleMeta(article, articleMetaSlot(c), c.QueryParam("currentUsername")))
}

func FavoriteArticleHandler(c echo.Context) error {
	slug := c.Param("slug")
	client := newArticleMetaClient(tokenFromRequest(c))
	if err := client.FavoriteArticle(slug); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error favoriting article")
	}
	return renderArticleMetaPair(c, client, slug)
}

func UnfavoriteArticleHandler(c echo.Context) error {
	slug := c.Param("slug")
	client := newArticleMetaClient(tokenFromRequest(c))
	if err := client.UnfavoriteArticle(slug); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error unfavoriting article")
	}
	return renderArticleMetaPair(c, client, slug)
}

func FollowProfileHandler(c echo.Context) error {
	articleSlug := c.QueryParam("articleSlug")
	if articleSlug == "" {
		return c.String(http.StatusBadRequest, "articleSlug is required")
	}

	client := newArticleMetaClient(tokenFromRequest(c))
	if err := client.FollowProfile(c.Param("username")); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error following profile")
	}
	return renderArticleMetaPair(c, client, articleSlug)
}

func UnfollowProfileHandler(c echo.Context) error {
	articleSlug := c.QueryParam("articleSlug")
	if articleSlug == "" {
		return c.String(http.StatusBadRequest, "articleSlug is required")
	}

	client := newArticleMetaClient(tokenFromRequest(c))
	if err := client.UnfollowProfile(c.Param("username")); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error unfollowing profile")
	}
	return renderArticleMetaPair(c, client, articleSlug)
}

func DeleteArticleHandler(c echo.Context) error {
	slug := c.Param("slug")
	client := newArticleMetaClient(tokenFromRequest(c))
	if err := client.DeleteArticle(slug); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error deleting article")
	}

	c.Response().Header().Set("HX-Redirect", "/")
	return c.NoContent(http.StatusOK)
}

func renderArticleMetaPair(c echo.Context, client articleMetaClient, slug string) error {
	article, err := client.GetArticle(slug)
	if err != nil {
		return c.String(http.StatusBadGateway, "error fetching article")
	}
	return renderArticleMeta(c, templates.ArticleMetaPair(article, articleMetaSlot(c), c.QueryParam("currentUsername")))
}

func renderArticleMeta(c echo.Context, component templ.Component) error {
	c.Response().Header().Set(echo.HeaderContentType, echo.MIMETextHTMLCharsetUTF8)
	c.Response().WriteHeader(http.StatusOK)
	return component.Render(c.Request().Context(), c.Response().Writer)
}

func articleMetaSlot(c echo.Context) string {
	if c.QueryParam("slot") == "actions" {
		return "actions"
	}
	return "banner"
}
