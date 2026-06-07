package templates

import (
	"bytes"
	"context"
	"strings"
	"testing"

	"conduit-hda/internal/api"

	"github.com/a-h/templ"
)

func TestArticleMetaRendersAuthorActions(t *testing.T) {
	article := sampleArticle()

	html := renderComponent(t, ArticleMeta(article, "banner", "alice"))

	assertContains(t, html, `<conduit-article-meta id="article-meta-banner" data-slot="banner">`)
	assertContains(t, html, `href="/@alice"`)
	assertContains(t, html, `href="/editor/hello-world"`)
	assertContains(t, html, `hx-delete="/hda/articles/hello-world"`)
	assertContains(t, html, `data-confirm-delete="true"`)
	assertNotContains(t, html, `/hda/profiles/alice/follow`)
	assertNotContains(t, html, `/hda/articles/hello-world/favorite`)
}

func TestArticleMetaRendersReaderActionsWithHtmxMutations(t *testing.T) {
	article := sampleArticle()

	html := renderComponent(t, ArticleMeta(article, "actions", "bob"))

	assertContains(t, html, `<conduit-article-meta id="article-meta-actions" data-slot="actions">`)
	assertContains(t, html, `hx-post="/hda/profiles/alice/follow?articleSlug=hello-world&amp;slot=actions&amp;currentUsername=bob"`)
	assertContains(t, html, `hx-post="/hda/articles/hello-world/favorite?slot=actions&amp;currentUsername=bob"`)
	assertContains(t, html, `hx-target="closest conduit-article-meta"`)
	assertContains(t, html, `hx-swap="outerHTML"`)
	assertNotContains(t, html, `href="/editor/hello-world"`)
	assertNotContains(t, html, `hx-delete="/hda/articles/hello-world"`)
}

func TestArticleMetaPairRendersOtherSlotOutOfBand(t *testing.T) {
	article := sampleArticle()

	html := renderComponent(t, ArticleMetaPair(article, "banner", "bob"))

	assertContains(t, html, `<conduit-article-meta id="article-meta-banner" data-slot="banner">`)
	assertContains(t, html, `<conduit-article-meta id="article-meta-actions" data-slot="actions" hx-swap-oob="true">`)
}

func renderComponent(t *testing.T, component templ.Component) string {
	t.Helper()
	var buf bytes.Buffer
	if err := component.Render(context.Background(), &buf); err != nil {
		t.Fatal(err)
	}
	return buf.String()
}

func sampleArticle() api.Article {
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

func assertContains(t *testing.T, html string, expected string) {
	t.Helper()
	if !strings.Contains(html, expected) {
		t.Fatalf("expected HTML to contain %q
HTML:
%s", expected, html)
	}
}

func assertNotContains(t *testing.T, html string, unexpected string) {
	t.Helper()
	if strings.Contains(html, unexpected) {
		t.Fatalf("expected HTML not to contain %q
HTML:
%s", unexpected, html)
	}
}
