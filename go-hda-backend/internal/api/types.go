package api

// TagsResponse est la réponse de l'endpoint GET /tags.
type TagsResponse struct {
	Tags []string `json:"tags"`
}

// ErrorResponse est le format d'erreur retourné par l'API RealWorld.
type ErrorResponse struct {
	Errors map[string][]string `json:"errors"`
}
