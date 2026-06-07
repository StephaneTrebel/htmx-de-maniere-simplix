package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetArticleUsesArticleEndpointAndAuthHeader(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("method = %s, want GET", r.Method)
		}
		if r.URL.Path != "/articles/hello-world" {
			t.Fatalf("path = %s, want /articles/hello-world", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Token jwt" {
			t.Fatalf("Authorization = %q, want %q", got, "Token jwt")
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(ArticleResponse{Article: Article{Slug: "hello-world", Title: "Hello"}})
	}))
	defer server.Close()

	client := &Client{base: server.URL, http: server.Client(), token: "jwt"}

	article, err := client.GetArticle("hello-world")
	if err != nil {
		t.Fatalf("GetArticle returned error: %v", err)
	}
	if article.Slug != "hello-world" {
		t.Fatalf("article slug = %q, want hello-world", article.Slug)
	}
}

func TestArticleMutationsUseExpectedMethodsAndPaths(t *testing.T) {
	var calls []string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("Authorization"); got != "Token jwt" {
			t.Fatalf("Authorization = %q, want %q", got, "Token jwt")
		}
		calls = append(calls, r.Method+" "+r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"article":{"slug":"hello-world"}}`))
	}))
	defer server.Close()

	client := &Client{base: server.URL, http: server.Client(), token: "jwt"}

	if err := client.FavoriteArticle("hello-world"); err != nil {
		t.Fatalf("FavoriteArticle returned error: %v", err)
	}
	if err := client.UnfavoriteArticle("hello-world"); err != nil {
		t.Fatalf("UnfavoriteArticle returned error: %v", err)
	}
	if err := client.DeleteArticle("hello-world"); err != nil {
		t.Fatalf("DeleteArticle returned error: %v", err)
	}

	want := []string{
		"POST /articles/hello-world/favorite",
		"DELETE /articles/hello-world/favorite",
		"DELETE /articles/hello-world",
	}
	assertCalls(t, calls, want)
}

func TestProfileFollowMutationsUseExpectedMethodsAndPaths(t *testing.T) {
	var calls []string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("Authorization"); got != "Token jwt" {
			t.Fatalf("Authorization = %q, want %q", got, "Token jwt")
		}
		calls = append(calls, r.Method+" "+r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"profile":{"username":"alice","following":true}}`))
	}))
	defer server.Close()

	client := &Client{base: server.URL, http: server.Client(), token: "jwt"}

	if err := client.FollowProfile("alice"); err != nil {
		t.Fatalf("FollowProfile returned error: %v", err)
	}
	if err := client.UnfollowProfile("alice"); err != nil {
		t.Fatalf("UnfollowProfile returned error: %v", err)
	}

	want := []string{
		"POST /profiles/alice/follow",
		"DELETE /profiles/alice/follow",
	}
	assertCalls(t, calls, want)
}

func assertCalls(t *testing.T, got []string, want []string) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("calls = %v, want %v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("calls[%d] = %q, want %q; all calls = %v", i, got[i], want[i], got)
		}
	}
}
