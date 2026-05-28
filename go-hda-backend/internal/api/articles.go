package api

import (
	"fmt"
	"net/url"
)

// GetArticles retourne une page d'articles, filtrés optionnellement par tag.
// page est 1-indexé. Retourne la liste, le nombre total d'articles et une éventuelle erreur.
func (c *Client) GetArticles(page int, tag string) ([]Article, int, error) {
	offset := (page - 1) * ArticlePageLimit
	path := fmt.Sprintf("/articles?limit=%d&offset=%d", ArticlePageLimit, offset)
	if tag != "" {
		path += "&tag=" + url.QueryEscape(tag)
	}

	var resp ArticlesResponse
	if err := c.do("GET", path, nil, &resp); err != nil {
		return nil, 0, err
	}
	return resp.Articles, resp.ArticlesCount, nil
}

// GetProfileArticles retourne une page d'articles d'un profil.
// articleType : "author" (articles écrits) ou "favorited" (articles favoris).
func (c *Client) GetProfileArticles(page int, username, articleType string) ([]Article, int, error) {
	offset := (page - 1) * ArticlePageLimit
	path := fmt.Sprintf("/articles?limit=%d&offset=%d&%s=%s",
		ArticlePageLimit, offset, articleType, url.QueryEscape(username))

	var resp ArticlesResponse
	if err := c.do("GET", path, nil, &resp); err != nil {
		return nil, 0, err
	}
	return resp.Articles, resp.ArticlesCount, nil
}
