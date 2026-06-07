package api

// TagsResponse est la réponse de l'endpoint GET /tags.
type TagsResponse struct {
	Tags []string `json:"tags"`
}

// ErrorResponse est le format d'erreur retourné par l'API RealWorld.
type ErrorResponse struct {
	Errors map[string][]string `json:"errors"`
}

// Author représente l'auteur d'un article.
type Author struct {
	Username  string `json:"username"`
	Image     string `json:"image"`
	Following bool   `json:"following"`
}

// Article représente un article RealWorld.
type Article struct {
	Slug           string   `json:"slug"`
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	TagList        []string `json:"tagList"`
	CreatedAt      string   `json:"createdAt"`
	Favorited      bool     `json:"favorited"`
	FavoritesCount int      `json:"favoritesCount"`
	Author         Author   `json:"author"`
}

// ArticlesResponse est la réponse de l'endpoint GET /articles.
type ArticlesResponse struct {
	Articles      []Article `json:"articles"`
	ArticlesCount int       `json:"articlesCount"`
}

// ArticleResponse est la réponse des endpoints qui retournent un article unique.
type ArticleResponse struct {
	Article Article `json:"article"`
}

// Comment représente un commentaire sur un article.
type Comment struct {
	ID        int    `json:"id"`
	Body      string `json:"body"`
	CreatedAt string `json:"createdAt"`
	Author    Author `json:"author"`
}

// CommentsResponse est la réponse de l'endpoint GET /articles/:slug/comments.
type CommentsResponse struct {
	Comments []Comment `json:"comments"`
}

// CommentResponse est la réponse de l'endpoint POST /articles/:slug/comments.
type CommentResponse struct {
	Comment Comment `json:"comment"`
}
