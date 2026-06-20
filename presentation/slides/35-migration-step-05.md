## Step-05 — ArticleMeta : une île réactive .[chapter]

ArticleMeta existait **deux fois** dans la page article :

- dans la bannière
- sous le corps de l'article

**Avant** — Preact gérait les callbacks `favorite`, `follow`, `delete`.

**Après** — deux points de montage HTMX :

```html
<div id="article-meta-banner"
     hx-get={articleMetaUrl('banner')}
     hx-trigger="load"
     hx-swap="outerHTML" />

<div id="article-meta-actions"
     hx-get={articleMetaUrl('actions')}
     hx-trigger="load"
     hx-swap="outerHTML" />
```

`Article.tsx` garde le routing et le Markdown. Go reprend les actions.

/*
Ce step est intéressant parce qu'on n'est plus sur une simple liste ou un formulaire.
ArticleMeta est une petite zone riche : identité auteur, boutons follow/favorite, édition ou suppression selon le contexte utilisateur.
Et surtout, elle existe deux fois dans la même page. Avant, Preact était le point naturel de synchronisation. Le step-05 enlève cette responsabilité du composant Preact.
*/

## Step-05 — WebComponent go brrr !

Go rend le HTML complet :

```html
<conduit-article-meta id="article-meta-banner" data-slot="banner">
  <div class="article-meta">
    …
    <button hx-post="/hda/articles/slug/favorite"
            hx-target="closest conduit-article-meta"
            hx-swap="outerHTML">
      Favorite Article
    </button>
  </div>
</conduit-article-meta>
```

Lit ajoute seulement le comportement local (en "light DOM") :

```ts
protected createRenderRoot() {
  return this; // pas de Shadow DOM
}
```

Le WebComponent **n'est pas la source du HTML**. Il enrichit le HTML serveur.

/*
Point important : ce n'est pas "HTMX partout, puis retour à une mini-SPA".
Le rendu reste côté Go. Le custom element garde le Light DOM, donc le HTML que Go envoie reste le HTML inspectable et échangeable par HTMX.
Lit sert ici à deux comportements locaux : confirmation avant delete et état busy pendant la requête. C'est une île de comportement, pas une île de rendu.
*/

## Step-05 — Synchroniser sans store client

Une mutation sur une occurrence renvoie **deux fragments** :

```go
templ ArticleMetaPair(article api.Article, activeSlot string, currentUsername string) {
    @ArticleMeta(article, activeSlot, currentUsername)
    @ArticleMetaOOB(article, otherArticleMetaSlot(activeSlot), currentUsername)
}
```

```html
<conduit-article-meta id="article-meta-actions" hx-swap-oob="true">
  …
</conduit-article-meta>
```

`hx-swap-oob` met à jour l'autre occurrence. Pas de state Preact partagé.

/*
Exemple à montrer en démo : cliquer Favorite en haut de l'article, et regarder le bouton du bas se synchroniser.
Le serveur fait la mutation, relit l'article, puis renvoie l'état complet des deux slots.
Le slot actif est remplacé par la réponse normale. L'autre slot est remplacé out-of-band grâce à son id.
La synchronisation vient du HTML retourné par le serveur, pas d'un store côté client.
*/
