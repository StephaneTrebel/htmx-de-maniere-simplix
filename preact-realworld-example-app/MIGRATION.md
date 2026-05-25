# Migration Analysis — Preact Conduit → Go + HTMX

> Document de référence exhaustif pour migrer l'application [RealWorld Conduit](https://github.com/gothinkster/realworld)
> de Preact (SPA) vers un backend Go + frontend HTMX.

---

## Table des matières

1. [Structure des dossiers](#1-structure-des-dossiers)
2. [Routes client-side](#2-routes-client-side)
3. [API — Inventaire exhaustif des appels réseau](#3-api--inventaire-exhaustif-des-appels-réseau)
4. [Modèles de données](#4-modèles-de-données)
5. [State management (Zustand)](#5-state-management-zustand)
6. [Composants — pages](#6-composants--pages)
7. [Composants partagés](#7-composants-partagés)
8. [Utilitaires](#8-utilitaires)
9. [Points d'attention pour la migration](#9-points-dattention-pour-la-migration)

---

## 1. Structure des dossiers

```
preact-realworld-example-app/
├── package.json                    # Dépendances : preact, preact-iso, zustand, ts-api-toolkit, snarkdown
├── tsconfig.json
└── public/                         # Racine du code source (convention WMR)
    ├── index.html                  # Point d'entrée HTML, charge /index.tsx en module ES
    ├── index.tsx                   # Root : App, routeur, composant AuthenticatedRoute
    ├── assets/
    │   ├── main.css                # CSS Conduit (Bootstrap 4 theme)
    │   ├── spinner.css             # Animation du spinner SVG
    │   └── favicon.ico
    ├── components/
    │   ├── ArticleCommentCard.tsx  # Carte d'un commentaire (affichage + suppression)
    │   ├── ArticleMeta.tsx         # Barre d'actions d'un article (follow/favorite/delete)
    │   ├── ArticlePreview.tsx      # Carte de prévisualisation d'un article (liste)
    │   ├── AuthErrorHandler.tsx    # Affichage des erreurs de formulaire auth
    │   ├── Footer.tsx              # Pied de page statique
    │   ├── Header.tsx              # Barre de navigation (aware de l'état auth)
    │   ├── Link.tsx                # Lien nav avec détection d'URL active
    │   ├── LoadingIndicator.tsx    # Spinner SVG générique
    │   ├── Pagination.tsx          # Pagination par numéros de pages
    │   └── PopularTags.tsx         # Sidebar des tags populaires
    ├── pages/
    │   ├── Home.tsx                # Page d'accueil (feed global / personnel / par tag)
    │   ├── Article.tsx             # Page de lecture d'un article + commentaires
    │   ├── Auth.tsx                # Page login et register (composant partagé)
    │   ├── Editor.tsx              # Page de création / édition d'article
    │   ├── Profile.tsx             # Page profil utilisateur (articles + favoris)
    │   └── Settings.tsx            # Page paramètres du compte connecté
    ├── services/api/
    │   ├── index.ts                # Configuration apiService (base URL, auth schema)
    │   ├── article.ts              # CRUD articles + favoris
    │   ├── auth.ts                 # Login, register, update profile
    │   ├── comments.ts             # CRUD commentaires
    │   ├── profile.ts              # Profil, follow/unfollow
    │   └── tags.ts                 # Liste des tags
    ├── store/
    │   └── index.ts                # Store Zustand (user, errors, actions auth)
    ├── types/
    │   ├── article.d.ts            # Interfaces Article, ArticleCore
    │   ├── comment.d.ts            # Interface ArticleComment
    │   ├── global.d.ts             # (vide)
    │   ├── response.d.ts           # Interfaces de réponses API
    │   ├── store.d.ts              # Interfaces RootState, Action (legacy)
    │   └── user.d.ts               # Interfaces User, Profile, LoginUser, RegistrationUser, SettingsUser
    └── utils/
        ├── constants.ts            # DEFAULT_AVATAR URL
        └── dateFormatter.ts        # Formatage de date en anglais (long format)
```

---

## 2. Routes client-side

Routeur : `preact-iso` (`<Router>` + `<Route path="...">`)

| Chemin | Composant | Auth requise | Notes |
|--------|-----------|:-----------:|-------|
| `/` | `HomePage` | non | Feed global ou personnel selon auth |
| `/article/:slug` | `ArticlePage` | non | Lecture d'article. Commentaires visibles à tous, écriture si connecté |
| `/login` | `AuthPage` | non | `isRegister=false` |
| `/register` | `AuthPage` | non | `isRegister=true` |
| `/editor/:slug?` | `EditorPage` | **oui** | Création si pas de slug, édition si slug présent |
| `/settings` | `SettingsPage` | **oui** | Mise à jour du profil connecté |
| `/@:username` | `ProfilePage` | non | Articles de l'auteur |
| `/@:username/favorites` | `ProfilePage` | non | Articles favoris de l'auteur |

Le composant `AuthenticatedRoute` redirige vers `/login` via `useEffect` si l'utilisateur n'est pas connecté.
Le `@` dans les URLs username est strippé côté composant (`replace(/^@/, '')`).

---

## 3. API — Inventaire exhaustif des appels réseau

**Base URL :** `https://api.realworld.show/api`
**Authentification :** header `Authorization: Token <jwt_token>`
**Bibliothèque cliente :** `ts-api-toolkit` (wrapper fetch)

### 3.1 Authentification — `services/api/auth.ts`

| Fonction | Méthode | Endpoint | Body | Réponse |
|----------|:-------:|----------|------|---------|
| `apiLogin` | POST | `/users/login` | `{ user: { email, password } }` | `{ user: User }` |
| `apiRegister` | POST | `/users` | `{ user: { username, email, password } }` | `{ user: User }` |
| `apiUpdateProfile` | PUT | `/user` | `{ user: Partial<SettingsUser> }` | `{ user: User }` |

### 3.2 Articles — `services/api/article.ts`

Constante de pagination : `articlePageLimit = 10`

| Fonction | Méthode | Endpoint | Params / Body | Réponse |
|----------|:-------:|----------|--------------|---------|
| `apiGetArticle` | GET | `/articles/:slug` | — | `{ article: Article }` |
| `apiGetFeed` | GET | `/articles/feed` | `?limit=10&offset=(page-1)*10` | `{ articles: Article[], articlesCount: number }` |
| `apiGetArticles` | GET | `/articles` | `?limit=10&offset=...&[author\|favorited\|tag]=string` | `{ articles: Article[], articlesCount: number }` |
| `apiCreateArticle` | POST | `/articles` | `{ article: ArticleCore }` | `{ article: Article }` |
| `apiUpdateArticle` | PUT | `/articles/:slug` | `{ article: ArticleCore }` | `{ article: Article }` |
| `apiFavoriteArticle` | POST | `/articles/:slug/favorite` | — | `{ article: Article }` |
| `apiUnfavoriteArticle` | DELETE | `/articles/:slug/favorite` | — | `{ article: Article }` |
| `apiDeleteArticle` | DELETE | `/articles/:slug` | — | `204 No Content` |

### 3.3 Commentaires — `services/api/comments.ts`

| Fonction | Méthode | Endpoint | Body | Réponse |
|----------|:-------:|----------|------|---------|
| `apiGetComments` | GET | `/articles/:slug/comments` | — | `{ comments: ArticleComment[] }` |
| `apiCreateComment` | POST | `/articles/:slug/comments` | `{ comment: { body: string } }` | `{ comment: ArticleComment }` |
| `apiDeleteComment` | DELETE | `/articles/:slug/comments/:id` | — | `204 No Content` |

### 3.4 Profils — `services/api/profile.ts`

| Fonction | Méthode | Endpoint | Body | Réponse |
|----------|:-------:|----------|------|---------|
| `apiGetProfile` | GET | `/profiles/:username` | — | `{ profile: Profile }` |
| `apiFollowProfile` | POST | `/profiles/:username/follow` | — | `{ profile: Profile }` |
| `apiUnfollowProfile` | DELETE | `/profiles/:username/follow` | — | `{ profile: Profile }` |

### 3.5 Tags — `services/api/tags.ts`

| Fonction | Méthode | Endpoint | Réponse |
|----------|:-------:|----------|---------|
| `apiGetAllTags` | GET | `/tags` | `{ tags: string[] }` |

---

## 4. Modèles de données

### Article

```typescript
interface ArticleCore {
  title: string;
  description: string;
  body: string;        // Corps en Markdown
  tagList: string[];
}

interface Article extends ArticleCore {
  slug: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
  author: Profile;
  favorited: boolean;
  favoritesCount: number;
}
```

### Utilisateur / Profil

```typescript
interface Profile {
  username: string;
  bio?: string;
  image?: string;      // URL avatar (nullable → fallback DEFAULT_AVATAR)
  following: boolean;
}

interface User {
  id: number;
  email: string;
  username: string;
  bio: string;
  image: string;
  token: string;       // JWT Bearer token
}

interface LoginUser {
  email: string;
  password: string;
}

interface RegistrationUser {
  username: string;
  email: string;
  password: string;
}

interface SettingsUser {
  image?: string;
  username: string;
  bio?: string;
  email: string;
  password: string;
}
```

### Commentaire

```typescript
interface ArticleComment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
}
```

### Enveloppes de réponses API

```typescript
interface UserResponse       { user: User; }
interface TagsResponse       { tags: string[]; }
interface ProfileResponse    { profile: Profile; }
interface ArticleResponse    { article: Article; }
interface ArticlesResponse   { articles: Article[]; articlesCount: number; }
interface CommentResponse    { comment: ArticleComment; }
interface CommentsResponse   { comments: ArticleComment[]; }
interface ResponseError      { [field: string]: string[]; }
```

> Toutes les réponses de l'API RealWorld sont enveloppées dans une clé racine.
> Ce pattern est défini dans la [spec RealWorld](https://realworld-docs.netlify.app/docs/specs/backend-specs/api-response-format).

---

## 5. State management (Zustand)

**Fichier :** `public/store/index.ts`

### État global

| Champ | Type | Description |
|-------|------|-------------|
| `user` | `User \| undefined` | Utilisateur connecté, persisté dans `localStorage` |
| `error` | `{ [field: string]: string[] }` | Erreurs API courantes (reset à chaque nouvelle action) |

### Actions

| Action | Description | Effets de bord |
|--------|-------------|----------------|
| `login(LoginUser)` | POST `/users/login` → sauve user | Écrit dans `localStorage`, sauve le token JWT via `authStorageService` |
| `logout()` | Reset user | Supprime token, vide `localStorage` |
| `register(RegistrationUser)` | POST `/users` → idem login | Idem login |
| `resetErrors()` | Vide `error` | — |
| `updateUserDetails(Partial<Profile>)` | PUT `/user` → met à jour user | Met à jour `localStorage` + Zustand |

### Persistance

- `localStorage.setItem('user', JSON.stringify(user))` à la connexion
- `localStorage.removeItem('user')` à la déconnexion
- `authStorageService.saveToken / destroyToken` (ts-api-toolkit) gère le token HTTP séparément dans `localStorage`

---

## 6. Composants — pages

### `HomePage` (`/`)

- **State local :** `articles[]`, `articlesCount`, `page`, `currentActiveTab` (`'personal' | 'global' | 'tag'`), `tag`, `isLoading`
- **Onglets :**
  - "Your Feed" → visible si connecté → appel `apiGetFeed`
  - "Global Feed" → appel `apiGetArticles` (sans filtre)
  - "#tag" → appel `apiGetArticles({ tag })`
- **Affiche :** bannière hero (si non connecté), liste de `ArticlePreview`, `Pagination`, `PopularTags` (sidebar)
- **Rechargement :** changement d'onglet ou de page → re-fetch complet

### `ArticlePage` (`/article/:slug`)

- **Props :** `{ params: { slug: string } }`
- **State :** `article`, `comments[]`, `commentBody`, `isLoading`
- Charge article + commentaires en parallèle au mount (`Promise.all`)
- Corps de l'article rendu via `snarkdown` (Markdown → HTML, `dangerouslySetInnerHTML`)
- Formulaire de commentaire visible mais soumission protégée par vérification de `user`
- Suppression de commentaire : filtre local optimiste après succès API

### `AuthPage` (`/login`, `/register`)

- **Prop :** `isRegister?: boolean`
- Formulaire unique, champ `username` conditionnel si register
- Validation HTML native : `checkValidity()`, pattern `.{8,}` sur le password
- Après succès → redirect `/`
- Affiche `AuthErrorHandler` pour les erreurs du store

### `EditorPage` (`/editor`, `/editor/:slug`)

- **Props :** `{ params: { slug?: string } }`
- **State :** `form: { title, description, body, tagList[] }`, `inProgress`
- Si `slug` présent : charge l'article existant et pré-remplit le formulaire
- Tags : saisie en texte libre séparé par espaces, splitée en `tagList[]` à la soumission
- Après création/édition → redirect `/article/:newSlug`

### `ProfilePage` (`/@:username`, `/@:username/favorites`)

- **Props :** `{ params: { username: string } }`
- Détecte le mode via l'URL courante : `/favorites` → filtre `favorited`, sinon `author`
- Bouton follow/unfollow avec mise à jour locale optimiste (avant retour API)
- Si profil = utilisateur connecté : affiche lien vers `/settings` à la place de follow

### `SettingsPage` (`/settings`)

- Protégée par `AuthenticatedRoute` (redirect `/login` si non connecté)
- Pré-remplit le formulaire depuis `state.user`
- Gestion du formulaire via `useReducer` (event-based, clé = attribut `name` de l'input)
- Bouton "Or click here to logout" → appelle `store.logout()` → redirect `/`

---

## 7. Composants partagés

### `Header`

Navigation conditionnelle selon l'état auth. Utilise `useStore` pour lire `user`.

| Si non connecté | Si connecté |
|----------------|-------------|
| Home | Home |
| Sign in | New Article |
| Sign up | Settings |
| — | `@username` (lien profil) |

### `Footer`

Statique : logo Conduit + attribution Thinkster.

### `Link`

Wrapper `<a>` avec classe CSS `active` automatique.
Supporte un prop `matcher` (fonction `(url) => boolean`) pour les patterns complexes (ex: détecter `/@.*`).

### `ArticlePreview`

Carte d'article dans une liste.

- Bouton favorite/unfavorite avec mise à jour locale de l'état
- Affiche : avatar auteur, username, date (via `dateFormatter`), titre, description, compteur favoris, tags

### `ArticleMeta`

Barre d'actions affichée dans la page article (banner + section actions).

| Si auteur = user connecté | Si autre auteur |
|--------------------------|----------------|
| Edit Article | Follow/Unfollow `@username` |
| Delete Article | Favorite/Unfavorite Article |

Toutes les actions mettent à jour l'état local immédiatement (optimistic update).

### `ArticleCommentCard`

Affiche un commentaire.
Le bouton de suppression (icône poubelle) n'est visible que si `user.username === comment.author.username`.
Après suppression API : appelle `props.onDelete()` → la page parente filtre sa liste locale.

### `AuthErrorHandler`

Lit `error` depuis le store Zustand.
Affiche `<ul class="error-messages">` si des erreurs existent, sinon `null`.
Format des erreurs : `{ [field]: [message1, message2, ...] }` → affiché comme `"field message1"`.

### `LoadingIndicator`

SVG spinner animé via CSS.
Props : `show` (visibilité), `style` (placement), `strokeColor`, `width`.

### `Pagination`

Calcule le nombre de pages depuis `count / articlePageLimit` (= 10).
Génère des `<li>` cliquables — pas de `href` (navigation via `onClick → setPage`).

### `PopularTags`

Charge les tags au mount via `apiGetAllTags`.
Chaque tag est un `<a href="#">` avec `onClick → props.onClick(tag)`.
La page `Home` gère le changement d'onglet en réponse.

---

## 8. Utilitaires

### `utils/constants.ts`

```typescript
DEFAULT_AVATAR = "https://api.realworld.io/images/smiley-cyrus.jpeg"
```

Utilisé comme fallback quand `user.image` ou `author.image` est absent/null.

### `utils/dateFormatter.ts`

```typescript
dateFormatter(dateString: string): string
// "2024-01-15T10:00:00Z" → "January 15, 2024"
// Utilise : new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
```

---

## 9. Points d'attention pour la migration

### Rendu Markdown

Le corps des articles est rendu via `snarkdown` (Markdown → HTML côté client).
**→ Go :** utiliser [`goldmark`](https://github.com/yuin/goldmark) ou [`blackfriday`](https://github.com/russross/blackfriday) côté serveur pour convertir avant d'envoyer le HTML.

### Authentification

Actuellement : JWT token dans `localStorage`, envoyé via header `Authorization: Token <jwt>`.
**→ Go + HTMX :** privilégier les **cookies de session httpOnly** (plus sécurisé, pas accessible depuis JS, gestion automatique par le navigateur). Implémenter un middleware Go de vérification de session sur les routes protégées.

### Pagination

La pagination actuelle n'utilise pas de vraies URLs (navigation via `onClick` + état local).
**→ HTMX :** utiliser des vrais liens avec paramètre `?page=N` et `hx-get` pour les requêtes partielles. Cela rend les pages navigables et partageables par URL.

### Tags

Saisie en texte libre, séparée par espaces, splitée en tableau `tagList[]`.
**→ Go :** reproduire le split côté serveur lors du parsing du formulaire HTML.

### Optimistic updates

Follow/unfollow et favorite/unfavorite mettent à jour l'UI avant le retour API.
**→ HTMX :** pattern naturel via remplacement de fragment HTML retourné par le serveur (`hx-swap`). Le serveur retourne directement le nouveau état rendu → pas de JS custom.

### Route avec `@` dans l'URL

Les URLs `/@username` sont routées vers `ProfilePage`, le `@` est strippé côté JS.
**→ Go :** gérer le pattern `/@:username` dans le routeur (ex: `chi`, `gorilla/mux`) et strip le `@` dans le handler.

### Protection des routes

`AuthenticatedRoute` redirige côté client (après le premier rendu).
**→ Go :** middleware côté serveur (vérification de cookie/session), redirect HTTP 302 → plus robuste, aucune fuite de contenu.

### Enveloppes JSON de l'API

Toutes les réponses sont enveloppées (`{ user: ... }`, `{ article: ... }`, etc.).
**→ Go :** si le backend Go sert directement des pages HTML via HTMX, les enveloppes JSON ne sont plus nécessaires. À garder uniquement si un client API JSON tiers doit rester compatible.

### Erreurs de formulaire

Les erreurs API sont au format `{ [field]: [message1, ...] }`.
**→ Go + HTMX :** retourner un fragment HTML partiel avec les erreurs (`hx-swap="outerHTML"` sur la zone d'erreur) plutôt qu'un JSON à parser côté client.

---

## Mapping Routes → Handlers Go (proposition)

| Route actuelle | Handler Go proposé | Auth |
|---------------|-------------------|:----:|
| `GET /` | `HomeHandler` | non |
| `GET /article/:slug` | `ArticleHandler` | non |
| `GET /login` | `LoginPageHandler` | non |
| `POST /login` | `LoginHandler` | non |
| `GET /register` | `RegisterPageHandler` | non |
| `POST /register` | `RegisterHandler` | non |
| `GET /editor` | `NewArticleHandler` | oui |
| `GET /editor/:slug` | `EditArticleHandler` | oui |
| `POST /editor` | `CreateArticleHandler` | oui |
| `PUT /editor/:slug` | `UpdateArticleHandler` | oui |
| `DELETE /article/:slug` | `DeleteArticleHandler` | oui |
| `GET /settings` | `SettingsPageHandler` | oui |
| `POST /settings` | `UpdateSettingsHandler` | oui |
| `POST /logout` | `LogoutHandler` | oui |
| `GET /@:username` | `ProfileHandler` | non |
| `GET /@:username/favorites` | `ProfileFavoritesHandler` | non |
| `POST /profiles/:username/follow` | `FollowHandler` | oui |
| `DELETE /profiles/:username/follow` | `UnfollowHandler` | oui |
| `POST /articles/:slug/favorite` | `FavoriteHandler` | oui |
| `DELETE /articles/:slug/favorite` | `UnfavoriteHandler` | oui |
| `POST /articles/:slug/comments` | `CreateCommentHandler` | oui |
| `DELETE /articles/:slug/comments/:id` | `DeleteCommentHandler` | oui |
