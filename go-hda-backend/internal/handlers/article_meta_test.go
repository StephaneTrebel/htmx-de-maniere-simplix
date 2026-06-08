package handlers

import (
	"conduit-hda/internal/api"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
)

func TestArticleMetaHandlerRendersRequestedSlot(t *testing.T) {
	fake := &fakeArticleMetaClient{article: sampleArticleMetaArticle()}
	withArticleMetaClient(t, fake)

	c, rec := articleMetaContext(http.MethodGet, "/hda/articles/hello-world/meta?slot=actions&currentUsername=bob", "slug", "hello-world")

	if err := ArticleMetaHandler(c); err != nil {
		t.Fatal(err)
	}

	assertStatus(t, rec, http.StatusOK)
	assertBodyContains(t, rec, `id="article-meta-actions"`)
	assertCalls(t, fake, "get:hello-world")
	assertTokens(t, fake, "jwt")
}

func TestFavoriteArticleHandlerMutatesAndRendersPair(t *testing.T) {
	fake := &fakeArticleMetaClient{article: sampleArticleMetaArticle()}
	withArticleMetaClient(t, fake)

	c, rec := articleMetaContext(http.MethodPost, "/hda/articles/hello-world/favorite?slot=banner&currentUsername=bob", "slug", "hello-world")

	if err := FavoriteArticleHandler(c); err != nil {
		t.Fatal(err)
	}

	assertStatus(t, rec, http.StatusOK)
	assertBodyContains(t, rec, `id="article-meta-banner"`)
	assertBodyContains(t, rec, `id="article-meta-actions" data-slot="actions" hx-swap-oob="true"`)
	assertCalls(t, fake, "favorite:hello-world", "get:hello-world")
}

func TestUnfavoriteArticleHandlerMutatesAndRendersPair(t *testing.T) {
	fake := &fakeArticleMetaClient{article: sampleArticleMetaArticle()}
	withArticleMetaClient(t, fake)

	c, rec := articleMetaContext(http.MethodDelete, "/hda/articles/hello-world/favorite?slot=actions&currentUsername=bob", "slug", "hello-world")

	if err := UnfavoriteArticleHandler(c); err != nil {
		t.Fatal(err)
	}

	assertStatus(t, rec, http.StatusOK)
	assertBodyContains(t, rec, `id="article-meta-actions"`)
	assertBodyContains(t, rec, `hx-swap-oob="true"`)
	assertCalls(t, fake, "unfavorite:hello-world", "get:hello-world")
}

func TestFollowProfileHandlerRequiresArticleSlugAndRendersPair(t *testing.T) {
	fake := &fakeArticleMetaClient{article: sampleArticleMetaArticle()}
	withArticleMetaClient(t, fake)

	missingSlug, missingRec := articleMetaContext(http.MethodPost, "/hda/profiles/alice/follow?slot=actions&currentUsername=bob", "username", "alice")
	if err := FollowProfileHandler(missingSlug); err != nil {
		t.Fatal(err)
	}
	assertStatus(t, missingRec, http.StatusBadRequest)
	assertCalls(t, fake)

	c, rec := articleMetaContext(http.MethodPost, "/hda/profiles/alice/follow?articleSlug=hello-world&slot=actions&currentUsername=bob", "username", "alice")
	if err := FollowProfileHandler(c); err != nil {
		t.Fatal(err)
	}

	assertStatus(t, rec, http.StatusOK)
	assertBodyContains(t, rec, `id="article-meta-actions"`)
	assertBodyContains(t, rec, `hx-swap-oob="true"`)
	assertCalls(t, fake, "follow:alice", "get:hello-world")
}

func TestUnfollowProfileHandlerRequiresArticleSlugAndRendersPair(t *testing.T) {
	fake := &fakeArticleMetaClient{article: sampleArticleMetaArticle()}
	withArticleMetaClient(t, fake)

	missingSlug, missingRec := articleMetaContext(http.MethodDelete, "/hda/profiles/alice/follow?slot=actions&currentUsername=bob", "username", "alice")
	if err := UnfollowProfileHandler(missingSlug); err != nil {
		t.Fatal(err)
	}
	assertStatus(t, missingRec, http.StatusBadRequest)
	assertCalls(t, fake)

	c, rec := articleMetaContext(http.MethodDelete, "/hda/profiles/alice/follow?articleSlug=hello-world&slot=banner&currentUsername=bob", "username", "alice")
	if err := UnfollowProfileHandler(c); err != nil {
		t.Fatal(err)
	}

	assertStatus(t, rec, http.StatusOK)
	assertBodyContains(t, rec, `id="article-meta-banner"`)
	assertBodyContains(t, rec, `hx-swap-oob="true"`)
	assertCalls(t, fake, "unfollow:alice", "get:hello-world")
}

func TestDeleteArticleHandlerSetsHXRedirect(t *testing.T) {
	fake := &fakeArticleMetaClient{article: sampleArticleMetaArticle()}
	withArticleMetaClient(t, fake)

	c, rec := articleMetaContext(http.MethodDelete, "/hda/articles/hello-world", "slug", "hello-world")

	if err := DeleteArticleHandler(c); err != nil {
		t.Fatal(err)
	}

	assertStatus(t, rec, http.StatusOK)
	if got := rec.Header().Get("HX-Redirect"); got != "/" {
		t.Fatalf("expected HX-Redirect to be /, got %q", got)
	}
	assertCalls(t, fake, "delete:hello-world")
}

func withArticleMetaClient(t *testing.T, fake *fakeArticleMetaClient) {
	t.Helper()
	old := newArticleMetaClient
	newArticleMetaClient = func(token string) articleMetaClient {
		fake.tokens = append(fake.tokens, token)
		return fake
	}
	t.Cleanup(func() {
		newArticleMetaClient = old
	})
}

func articleMetaContext(method string, target string, paramName string, paramValue string) (echo.Context, *httptest.ResponseRecorder) {
	e := echo.New()
	req := httptest.NewRequest(method, target, nil)
	req.Header.Set("Authorization", "Token jwt")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames(paramName)
	c.SetParamValues(paramValue)
	return c, rec
}

type fakeArticleMetaClient struct {
	article api.Article
	calls   []string
	tokens  []string
}

func (f *fakeArticleMetaClient) GetArticle(slug string) (api.Article, error) {
	f.calls = append(f.calls, "get:"+slug)
	return f.article, nil
}

func (f *fakeArticleMetaClient) FavoriteArticle(slug string) error {
	f.calls = append(f.calls, "favorite:"+slug)
	return nil
}

func (f *fakeArticleMetaClient) UnfavoriteArticle(slug string) error {
	f.calls = append(f.calls, "unfavorite:"+slug)
	return nil
}

func (f *fakeArticleMetaClient) DeleteArticle(slug string) error {
	f.calls = append(f.calls, "delete:"+slug)
	return nil
}

func (f *fakeArticleMetaClient) FollowProfile(username string) error {
	f.calls = append(f.calls, "follow:"+username)
	return nil
}

func (f *fakeArticleMetaClient) UnfollowProfile(username string) error {
	f.calls = append(f.calls, "unfollow:"+username)
	return nil
}

func sampleArticleMetaArticle() api.Article {
	return api.Article{
		Slug:           "hello-world",
		Title:          "Hello World",
		CreatedAt:      "2025-02-03T10:11:12Z",
		Favorited:      false,
		FavoritesCount: 3,
		Author: api.Author{
			Username:  "alice",
			Image:     "https://example.com/alice.png",
			Following: false,
		},
	}
}

func assertStatus(t *testing.T, rec *httptest.ResponseRecorder, expected int) {
	t.Helper()
	if rec.Code != expected {
		t.Fatalf("expected status %d, got %d with body %q", expected, rec.Code, rec.Body.String())
	}
}

func assertBodyContains(t *testing.T, rec *httptest.ResponseRecorder, expected string) {
	t.Helper()
	if !strings.Contains(rec.Body.String(), expected) {
		t.Fatalf("expected body to contain %q\nbody:\n%s", expected, rec.Body.String())
	}
}

func assertCalls(t *testing.T, fake *fakeArticleMetaClient, expected ...string) {
	t.Helper()
	got := strings.Join(fake.calls, ",")
	want := strings.Join(expected, ",")
	if got != want {
		t.Fatalf("expected calls %q, got %q", want, got)
	}
}

func assertTokens(t *testing.T, fake *fakeArticleMetaClient, expected ...string) {
	t.Helper()
	got := strings.Join(fake.tokens, ",")
	want := strings.Join(expected, ",")
	if got != want {
		t.Fatalf("expected tokens %q, got %q", want, got)
	}
}
