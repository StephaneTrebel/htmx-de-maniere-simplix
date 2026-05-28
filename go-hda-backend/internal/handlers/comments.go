package handlers

import (
	"conduit-hda/internal/api"
	"conduit-hda/internal/templates"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

// tokenFromRequest extrait le JWT de l'header Authorization ("Token xxx").
func tokenFromRequest(c echo.Context) string {
	return strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Token ")
}

// CommentsHandler gère GET /hda/articles/:slug/comments.
//
// Query params :
//   - username  : nom de l'utilisateur connecté (vide si anonyme)
//   - userImage : avatar de l'utilisateur connecté (pour le formulaire)
//
// Le JWT est lu depuis l'header Authorization et propagé à l'API Conduit.
// Le fragment retourné contient la liste + le formulaire (si authentifié).
func CommentsHandler(c echo.Context) error {
	slug := c.Param("slug")
	username := c.QueryParam("username")
	userImage := c.QueryParam("userImage")

	client := api.New(tokenFromRequest(c))
	comments, err := client.GetComments(slug)
	if err != nil {
		comments = []api.Comment{}
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	c.Response().WriteHeader(http.StatusOK)
	return templates.CommentsFeed(comments, slug, username, userImage).Render(c.Request().Context(), c.Response().Writer)
}

// CreateCommentHandler gère POST /hda/articles/:slug/comments.
//
// Form body :
//   - body      : texte du commentaire
//   - username  : utilisateur connecté (pour re-rendre le fragment)
//   - userImage : avatar (pour re-rendre le formulaire)
//
// Après création, retourne le fragment complet mis à jour.
func CreateCommentHandler(c echo.Context) error {
	slug := c.Param("slug")
	body := c.FormValue("body")
	username := c.FormValue("username")
	userImage := c.FormValue("userImage")

	if body == "" {
		return c.String(http.StatusBadRequest, "body is required")
	}

	client := api.New(tokenFromRequest(c))
	if _, err := client.CreateComment(slug, body); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error creating comment")
	}

	comments, err := client.GetComments(slug)
	if err != nil {
		comments = []api.Comment{}
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	c.Response().WriteHeader(http.StatusOK)
	return templates.CommentsFeed(comments, slug, username, userImage).Render(c.Request().Context(), c.Response().Writer)
}

// DeleteCommentHandler gère DELETE /hda/articles/:slug/comments/:id.
//
// Form body (via hx-vals) :
//   - username  : utilisateur connecté (pour re-rendre le fragment)
//   - userImage : avatar (pour re-rendre le formulaire)
//
// Après suppression, retourne le fragment complet mis à jour.
func DeleteCommentHandler(c echo.Context) error {
	slug := c.Param("slug")
	username := c.FormValue("username")
	userImage := c.FormValue("userImage")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.String(http.StatusBadRequest, "invalid comment id")
	}

	client := api.New(tokenFromRequest(c))
	if err := client.DeleteComment(slug, id); err != nil {
		return c.String(http.StatusUnprocessableEntity, "error deleting comment")
	}

	comments, err := client.GetComments(slug)
	if err != nil {
		comments = []api.Comment{}
	}

	c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
	c.Response().WriteHeader(http.StatusOK)
	return templates.CommentsFeed(comments, slug, username, userImage).Render(c.Request().Context(), c.Response().Writer)
}
