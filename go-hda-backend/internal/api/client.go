package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	BaseURL            = "https://api.realworld.show/api"
	DefaultAvatar      = "https://api.realworld.io/images/smiley-cyrus.jpeg"
	ArticlePageLimit   = 10
)

// Client est le client HTTP vers l'API RealWorld.
type Client struct {
	base   string
	http   *http.Client
	token  string // JWT optionnel, injecté par le middleware session
}

// New crée un client API. token peut être vide pour les requêtes anonymes.
func New(token string) *Client {
	return &Client{
		base:  BaseURL,
		http:  &http.Client{Timeout: 10 * time.Second},
		token: token,
	}
}

// do exécute une requête HTTP et décode la réponse JSON dans v.
// Retourne une *ErrorResponse si le code HTTP est >= 400.
func (c *Client) do(method, path string, body interface{}, v interface{}) error {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("marshal request: %w", err)
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, c.base+path, bodyReader)
	if err != nil {
		return fmt.Errorf("new request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if c.token != "" {
		req.Header.Set("Authorization", "Token "+c.token)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode >= 400 {
		var apiErr ErrorResponse
		if jsonErr := json.Unmarshal(raw, &apiErr); jsonErr == nil && len(apiErr.Errors) > 0 {
			return &APIError{Status: resp.StatusCode, Errors: apiErr.Errors}
		}
		return &APIError{Status: resp.StatusCode, Errors: map[string][]string{"server": {http.StatusText(resp.StatusCode)}}}
	}

	if v != nil && len(raw) > 0 {
		if err := json.Unmarshal(raw, v); err != nil {
			return fmt.Errorf("unmarshal response: %w", err)
		}
	}

	return nil
}

// APIError représente une erreur retournée par l'API.
type APIError struct {
	Status int
	Errors map[string][]string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("API error %d: %v", e.Status, e.Errors)
}
