# Step 05 Webcomponent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `ArticleMeta` to a Go-rendered `<conduit-article-meta>` Web Component enhanced with Lit, with HTMX mutations returning HTML and both article-meta occurrences synchronized.

**Architecture:** `Article.tsx` remains the Preact page shell and mounts two HTMX fragments. Go renders the full `conduit-article-meta` markup, handles favorite/follow/delete mutations, and returns the next HTML state including out-of-band swaps. The SPA bundle registers a Lit `ReactiveElement` enhancer that preserves server-rendered Light DOM, manages busy/confirmation behavior, and never reads JWT or JSON article state.

**Tech Stack:** Go, Echo, templ, HTMX, Preact/WMR, Lit (`ReactiveElement`), Zustand JWT bridge already present.

---

**Resume State, 2026-06-07 late session:**

- Worktree: `/home/stephane/.config/superpowers/worktrees/htmx-de-maniere-simplix/step-05-webcomponent` on branch `step-05-webcomponent`.
- Completed: Task 1 API client methods, including RED then GREEN for `cd go-hda-backend && go test ./internal/api`.
- In progress next: Task 2, Step 1: write failing template render tests for `ArticleMeta`. No Task 2 files have been created yet.
- Not started: handlers/routes, SPA Lit integration, docs update, full validation.
- Last known verification before pause: `go test ./internal/api` passed after Task 1 implementation.

---

### File Structure

- Create `go-hda-backend/internal/api/articles_test.go`: tests RealWorld article/profile client paths, methods, auth headers, and request bodies.
- Modify `go-hda-backend/internal/api/types.go`: add `ArticleResponse`.
- Modify `go-hda-backend/internal/api/articles.go`: add `GetArticle`, `FavoriteArticle`, `UnfavoriteArticle`, `DeleteArticle`, `FollowProfile`, `UnfollowProfile`.
- Create `go-hda-backend/internal/templates/article_meta.templ`: Go-rendered custom element and OOB pair templates.
- Create `go-hda-backend/internal/templates/article_meta_test.go`: render tests for author/non-author/OOB HTML.
- Generate `go-hda-backend/internal/templates/article_meta_templ.go` with `make templ`.
- Create `go-hda-backend/internal/handlers/article_meta_test.go`: handler tests with fake client factory.
- Create `go-hda-backend/internal/handlers/article_meta.go`: HTMX fragment and mutation handlers.
- Modify `go-hda-backend/cmd/server/main.go`: register step-05 routes.
- Create `preact-realworld-example-app/public/webcomponents/conduit-article-meta.ts`: Lit enhancer.
- Modify `preact-realworld-example-app/public/index.tsx`: import/register the Web Component.
- Modify `preact-realworld-example-app/public/pages/Article.tsx`: replace two `ArticleMeta` uses with HTMX mounts and process them with comments.
- Modify `preact-realworld-example-app/public/types/global.d.ts`: add `hx-swap-oob`, `hx-confirm` if needed, and custom event typing.
- Modify `preact-realworld-example-app/package.json` and `package-lock.json`: add `lit`.
- Modify `MIGRATION_STEP.md`: document `step-05-webcomponent`.
- Modify `README.md`: add roadmap row and `Possible Enhancement` section for future JWT/auth deep dive.

---

### Task 1: API Client Methods

**Files:**
- Create: `go-hda-backend/internal/api/articles_test.go`
- Modify: `go-hda-backend/internal/api/types.go`
- Modify: `go-hda-backend/internal/api/articles.go`

- [x] **Step 1: Write failing API client tests**

Create `go-hda-backend/internal/api/articles_test.go` with tests that instantiate `Client{base: server.URL, http: server.Client(), token: "jwt"}` in package `api`. Cover:

```go
func TestGetArticleUsesArticleEndpointAndAuthHeader(t *testing.T)
func TestArticleMutationsUseExpectedMethodsAndPaths(t *testing.T)
func TestProfileFollowMutationsUseExpectedMethodsAndPaths(t *testing.T)
```

The tests must assert:

```go
req.Method == "GET"
req.URL.Path == "/articles/hello-world"
req.Header.Get("Authorization") == "Token jwt"
```

and mutation calls must hit:

```text
POST   /articles/hello-world/favorite
DELETE /articles/hello-world/favorite
DELETE /articles/hello-world
POST   /profiles/alice/follow
DELETE /profiles/alice/follow
```

- [x] **Step 2: Run API tests and verify RED**

Run: `cd go-hda-backend && go test ./internal/api`

Expected: FAIL because `GetArticle`, `FavoriteArticle`, `UnfavoriteArticle`, `DeleteArticle`, `FollowProfile`, `UnfollowProfile`, or `ArticleResponse` are undefined.

- [x] **Step 3: Implement API methods minimally**

Add to `types.go`:

```go
type ArticleResponse struct {
    Article Article `json:"article"`
}
```

Add methods to `articles.go` using `url.PathEscape(slug)` and `c.do(...)`:

```go
func (c *Client) GetArticle(slug string) (Article, error)
func (c *Client) FavoriteArticle(slug string) error
func (c *Client) UnfavoriteArticle(slug string) error
func (c *Client) DeleteArticle(slug string) error
func (c *Client) FollowProfile(username string) error
func (c *Client) UnfollowProfile(username string) error
```

- [x] **Step 4: Run API tests and verify GREEN**

Run: `cd go-hda-backend && go test ./internal/api`

Expected: PASS.

---

### Task 2: ArticleMeta Templates

**Files:**
- Create: `go-hda-backend/internal/templates/article_meta_test.go`
- Create: `go-hda-backend/internal/templates/article_meta.templ`
- Generate: `go-hda-backend/internal/templates/article_meta_templ.go`

- [ ] **Step 1: Write failing template render tests**

Create tests in package `templates` with a helper:

```go
func renderComponent(t *testing.T, component templ.Component) string {
    t.Helper()
    var buf bytes.Buffer
    if err := component.Render(context.Background(), &buf); err != nil {
        t.Fatal(err)
    }
    return buf.String()
}
```

Test cases:

```go
func TestArticleMetaRendersAuthorActions(t *testing.T)
func TestArticleMetaRendersReaderActionsWithHtmxMutations(t *testing.T)
func TestArticleMetaPairRendersOtherSlotOutOfBand(t *testing.T)
```

Assert substrings such as:

```text
<conduit-article-meta id="article-meta-banner" data-slot="banner">
href="/editor/hello-world"
hx-delete="/hda/articles/hello-world"
hx-post="/hda/profiles/alice/follow?articleSlug=hello-world&amp;slot=actions&amp;currentUsername=bob"
hx-post="/hda/articles/hello-world/favorite?slot=actions&amp;currentUsername=bob"
hx-swap-oob="true"
```

- [ ] **Step 2: Run template tests and verify RED**

Run: `cd go-hda-backend && go test ./internal/templates`

Expected: FAIL because `ArticleMeta` and `ArticleMetaPair` are undefined.

- [ ] **Step 3: Implement `article_meta.templ`**

Define:

```go
templ ArticleMeta(article api.Article, slot string, currentUsername string)
templ ArticleMetaOOB(article api.Article, slot string, currentUsername string)
templ ArticleMetaPair(article api.Article, activeSlot string, currentUsername string)
```

Also define helper functions:

```go
func articleMetaID(slot string) string
func otherArticleMetaSlot(slot string) string
func articleMetaFavoriteURL(slug, slot, currentUsername string) string
func articleMetaFollowURL(username, articleSlug, slot, currentUsername string) string
```

Use `hx-target="closest conduit-article-meta"` and `hx-swap="outerHTML"` on mutation buttons.

- [ ] **Step 4: Generate templ code**

Run: `cd go-hda-backend && make templ`

Expected: new `article_meta_templ.go` generated without errors.

- [ ] **Step 5: Run template tests and verify GREEN**

Run: `cd go-hda-backend && go test ./internal/templates`

Expected: PASS.

---

### Task 3: ArticleMeta Handlers and Routes

**Files:**
- Create: `go-hda-backend/internal/handlers/article_meta_test.go`
- Create: `go-hda-backend/internal/handlers/article_meta.go`
- Modify: `go-hda-backend/cmd/server/main.go`

- [ ] **Step 1: Write failing handler tests**

Create tests in package `handlers` using a fake `articleMetaClient` and temporary replacement of `newArticleMetaClient`.

Test cases:

```go
func TestArticleMetaHandlerRendersRequestedSlot(t *testing.T)
func TestFavoriteArticleHandlerMutatesAndRendersPair(t *testing.T)
func TestFollowProfileHandlerRequiresArticleSlugAndRendersPair(t *testing.T)
func TestDeleteArticleHandlerSetsHXRedirect(t *testing.T)
```

Assert status, body, and fake-client calls:

```text
GET handler body contains id="article-meta-actions"
Favorite handler calls favorite:hello-world then get:hello-world
Follow handler returns 400 when articleSlug is missing
Delete handler sets HX-Redirect to /
```

- [ ] **Step 2: Run handler tests and verify RED**

Run: `cd go-hda-backend && go test ./internal/handlers`

Expected: FAIL because article-meta handlers and client factory are undefined.

- [ ] **Step 3: Implement handlers**

Create `article_meta.go` with:

```go
type articleMetaClient interface {
    GetArticle(slug string) (api.Article, error)
    FavoriteArticle(slug string) error
    UnfavoriteArticle(slug string) error
    DeleteArticle(slug string) error
    FollowProfile(username string) error
    UnfollowProfile(username string) error
}

var newArticleMetaClient = func(token string) articleMetaClient { return api.New(token) }
```

Implement:

```go
func ArticleMetaHandler(c echo.Context) error
func FavoriteArticleHandler(c echo.Context) error
func UnfavoriteArticleHandler(c echo.Context) error
func FollowProfileHandler(c echo.Context) error
func UnfollowProfileHandler(c echo.Context) error
func DeleteArticleHandler(c echo.Context) error
```

- [ ] **Step 4: Register routes**

In `cmd/server/main.go`, add:

```go
e.GET("/hda/articles/:slug/meta", handlers.ArticleMetaHandler)
e.POST("/hda/articles/:slug/favorite", handlers.FavoriteArticleHandler)
e.DELETE("/hda/articles/:slug/favorite", handlers.UnfavoriteArticleHandler)
e.POST("/hda/profiles/:username/follow", handlers.FollowProfileHandler)
e.DELETE("/hda/profiles/:username/follow", handlers.UnfollowProfileHandler)
e.DELETE("/hda/articles/:slug", handlers.DeleteArticleHandler)
```

- [ ] **Step 5: Run handler tests and verify GREEN**

Run: `cd go-hda-backend && go test ./internal/handlers`

Expected: PASS.

---

### Task 4: SPA Mounts and Lit Enhancer

**Files:**
- Modify: `preact-realworld-example-app/package.json`
- Modify: `preact-realworld-example-app/package-lock.json`
- Create: `preact-realworld-example-app/public/webcomponents/conduit-article-meta.ts`
- Modify: `preact-realworld-example-app/public/index.tsx`
- Modify: `preact-realworld-example-app/public/pages/Article.tsx`
- Modify: `preact-realworld-example-app/public/types/global.d.ts`

- [ ] **Step 1: Verify RED for missing Lit dependency**

Create `conduit-article-meta.ts` importing `ReactiveElement` from `lit`, import it from `index.tsx`, then run:

`cd preact-realworld-example-app && npm run build`

Expected: FAIL with module resolution error for `lit`.

- [ ] **Step 2: Add Lit dependency**

Run: `cd preact-realworld-example-app && npm install lit --save`

Expected: `package.json` and `package-lock.json` updated, `node_modules/lit` present.

- [ ] **Step 3: Implement Lit enhancer**

`conduit-article-meta.ts` should define a `ReactiveElement` subclass that:

```ts
customElements.define('conduit-article-meta', ConduitArticleMeta);
```

Behavior:

```ts
connectedCallback(): void {
  super.connectedCallback();
  this.addEventListener('click', this.confirmDelete, true);
  this.addEventListener('htmx:beforeRequest', this.handleBeforeRequest as EventListener);
  this.addEventListener('htmx:afterRequest', this.handleAfterRequest as EventListener);
  queueMicrotask(() => window.htmx?.process(this));
}
```

It must preserve server-rendered Light DOM by not implementing a render template.

- [ ] **Step 4: Replace ArticleMeta usages in Article.tsx**

Remove `ArticleMeta` import. Add two HTMX mounts:

```tsx
<div id="article-meta-banner" hx-get={articleMetaUrl('banner')} hx-trigger="load" hx-swap="outerHTML" />
<div id="article-meta-actions" hx-get={articleMetaUrl('actions')} hx-trigger="load" hx-swap="outerHTML" />
```

Use `currentUsername=${encodeURIComponent(user?.username ?? '')}` in the URL. Process the shared HDA container with `window.htmx.process(...)` after article load.

- [ ] **Step 5: Run SPA build and verify GREEN**

Run: `cd preact-realworld-example-app && npm run build`

Expected: PASS.

---

### Task 5: Documentation and Full Validation

**Files:**
- Modify: `MIGRATION_STEP.md`
- Modify: `README.md`

- [ ] **Step 1: Update migration docs**

Rewrite `MIGRATION_STEP.md` for `step-05-webcomponent`, covering objective, diff from `step-04`, files changed, commands, narrative, known limits.

- [ ] **Step 2: Update README**

Add roadmap row for `step-05-webcomponent` and a `Possible Enhancement` section documenting the future JWT/auth deep dive.

- [ ] **Step 3: Run backend generation and checks**

Run:

```bash
cd go-hda-backend && make templ
cd go-hda-backend && go test ./...
cd go-hda-backend && go build ./... && go vet ./...
```

Expected: all exit 0.

- [ ] **Step 4: Run SPA build**

Run: `cd preact-realworld-example-app && npm run build`

Expected: exit 0.

- [ ] **Step 5: Verify presentation is untouched by step-05**

Run: `git diff --name-only step-04-comments...HEAD | grep presentation/ && echo "ERREUR" || echo "OK"`

Expected: `OK`.

- [ ] **Step 6: Commit implementation**

Stage explicit paths only and commit:

```bash
rtk git add MIGRATION_STEP.md README.md go-hda-backend preact-realworld-example-app docs/superpowers/plans/2026-06-07-step-05-webcomponent-implementation.md
rtk git commit -m "feat: migrate article meta to web component"
```
