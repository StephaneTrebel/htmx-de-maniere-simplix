package api

// GetTags retourne la liste de tous les tags.
func (c *Client) GetTags() ([]string, error) {
	var resp TagsResponse
	if err := c.do("GET", "/tags", nil, &resp); err != nil {
		return nil, err
	}
	return resp.Tags, nil
}
