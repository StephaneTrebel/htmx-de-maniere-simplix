package api

import "fmt"

// GetComments récupère les commentaires d'un article. Requête anonyme.
func (c *Client) GetComments(slug string) ([]Comment, error) {
	var resp CommentsResponse
	if err := c.do("GET", fmt.Sprintf("/articles/%s/comments", slug), nil, &resp); err != nil {
		return nil, err
	}
	return resp.Comments, nil
}

// CreateComment poste un commentaire sur un article. Requiert un JWT dans le client.
func (c *Client) CreateComment(slug, body string) (Comment, error) {
	payload := map[string]any{
		"comment": map[string]string{"body": body},
	}
	var resp CommentResponse
	if err := c.do("POST", fmt.Sprintf("/articles/%s/comments", slug), payload, &resp); err != nil {
		return Comment{}, err
	}
	return resp.Comment, nil
}

// DeleteComment supprime un commentaire. Requiert un JWT dans le client.
func (c *Client) DeleteComment(slug string, id int) error {
	return c.do("DELETE", fmt.Sprintf("/articles/%s/comments/%d", slug, id), nil, nil)
}
