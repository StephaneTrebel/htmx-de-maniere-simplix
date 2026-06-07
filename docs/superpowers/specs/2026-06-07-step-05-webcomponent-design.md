# Design — step-05-webcomponent

## Contexte

La branche `step-05-webcomponent` est le dernier jalon de la demonstration de migration progressive de l'application RealWorld depuis une SPA Preact vers une application HDA Go + HTMX.

Les steps precedents ont deja migre :

- `step-01-go-hda-proxy` : `PopularTags`
- `step-02-article-feed` : feed Home, onglets et pagination
- `step-03-profile` : feed articles d'un profil
- `step-04-comments` : commentaires avec operations d'ecriture via HTMX

`step-05-webcomponent` migre uniquement `ArticleMeta`, visible deux fois sur la page article : dans la banniere et sous le corps de l'article. Le titre, le corps Markdown, le shell de page `Article.tsx` et la section commentaires restent dans leur etat `step-04`.

## Objectifs

- Montrer qu'un composant Preact restant peut migrer vers un Web Component Lit sans changer le rendu visuel.
- Garder la priorite sur l'interoperabilite SPA / Web Component.
- Renforcer le modele HDA : Go rend le markup et les mutations renvoient du HTML, pas du JSON d'etat UI.
- Reutiliser le meme Web Component pour les deux occurrences de `ArticleMeta`.
- Garder le JWT hors du DOM, comme en `step-04`.
- Ne pas modifier `presentation/`.

## Non-objectifs

- Ne pas migrer toute la page article cote Go.
- Ne pas migrer le rendu Markdown de l'article.
- Ne pas transformer Lit en moteur de rendu de l'etat article.
- Ne pas exposer le JWT dans des attributs HTML ou des champs caches.
- Ne pas ajouter un step complet sur l'authentification ou la gestion du JWT.
- Ne pas changer l'apparence Conduit existante.

## Approche retenue

Approche A : Go rend un custom element complet, HTMX porte les mutations, Lit enrichit le DOM.

Go rend des fragments `<conduit-article-meta>` contenant tout le HTML interne :

- wrapper `article-meta`
- avatar, auteur, date
- liens Edit Article
- boutons Delete Article, Follow/Unfollow, Favorite/Unfavorite
- attributs HTMX sur les boutons interactifs

Lit enregistre `<conduit-article-meta>` dans le bundle SPA existant. Le composant utilise le Light DOM pour conserver les styles Conduit deja presents. Il enrichit le HTML serveur, mais ne le remplace pas par un rendu Lit fonde sur du JSON.

## Architecture

`Article.tsx` reste le shell Preact de la page article.

Il continue a :

- recuperer l'article via l'API JSON existante pour afficher le titre ;
- rendre le corps Markdown ;
- monter le fragment commentaires de `step-04`.

Il remplace les deux usages de `ArticleMeta` par deux points de montage HTMX :

- un emplacement `banner` dans la banniere ;
- un emplacement `actions` sous le corps de l'article.

Chaque emplacement charge un fragment Go, par exemple :

- `GET /hda/articles/:slug/meta?slot=banner&currentUsername=...`
- `GET /hda/articles/:slug/meta?slot=actions&currentUsername=...`

Le backend Go refetch l'article cote serveur pour rendre chaque fragment. Le double fetch est accepte : il garde une frontiere HDA simple et evite de transmettre l'etat article depuis Preact vers Go ou Lit.

`currentUsername` est lu depuis Zustand par `Article.tsx` et transmis comme parametre de rendu non sensible. Il permet seulement a Go de choisir le markup correct : boutons Edit/Delete pour l'auteur, boutons Follow/Favorite sinon. L'autorisation reelle des mutations reste portee par le JWT dans l'header `Authorization`.

## Routes Go

Routes prevues :

- `GET /hda/articles/:slug/meta`
  - rend une occurrence de `<conduit-article-meta>` pour le `slot` demande.
  - query params : `slot`, `currentUsername`.

- `POST /hda/articles/:slug/favorite`
  - favorite l'article, refetch l'article, renvoie les deux occurrences mises a jour.
  - recoit `slot` et `currentUsername` pour rendre les fragments de retour.

- `DELETE /hda/articles/:slug/favorite`
  - retire le favori, refetch l'article, renvoie les deux occurrences mises a jour.
  - recoit `slot` et `currentUsername` pour rendre les fragments de retour.

- `POST /hda/profiles/:username/follow`
  - follow le profil, refetch l'article, renvoie les deux occurrences mises a jour.
  - recoit `articleSlug`, `slot` et `currentUsername` en parametres de contexte pour rendre les fragments de retour.

- `DELETE /hda/profiles/:username/follow`
  - unfollow le profil, refetch l'article, renvoie les deux occurrences mises a jour.
  - recoit `articleSlug`, `slot` et `currentUsername` en parametres de contexte pour rendre les fragments de retour.

- `DELETE /hda/articles/:slug`
  - supprime l'article, puis renvoie `HX-Redirect: /`.

Les handlers utilisent le token extrait de l'header `Authorization`, injecte par le listener global `htmx:configRequest` deja ajoute en `step-04`.

## Synchronisation des deux occurrences

La page article affiche `ArticleMeta` deux fois. Apres une mutation `favorite` ou `follow`, les deux occurrences doivent etre remplacees ensemble pour eviter un etat visuel incoherent.

La reponse Go contient :

- le fragment principal qui remplace l'occurrence ciblee par `hx-target="closest conduit-article-meta"` et `hx-swap="outerHTML"` ;
- un fragment secondaire avec `hx-swap-oob` pour remplacer l'autre occurrence.

Chaque `<conduit-article-meta>` aura un identifiant stable derive du slug et du slot, par exemple :

- `article-meta-banner`
- `article-meta-actions`

Le template Go peut ainsi rendre une reponse multi-fragment sans logique client specifique pour choisir l'autre cible.

## Markup HTMX

Les boutons rendus par Go portent les attributs HTMX.

Exemple conceptuel :

```html
<conduit-article-meta id="article-meta-banner" data-slot="banner">
  <div class="article-meta">
    ...
    <button
      class="btn btn-sm btn-outline-primary"
      hx-post="/hda/articles/my-slug/favorite?slot=banner&amp;currentUsername=alice"
      hx-target="closest conduit-article-meta"
      hx-swap="outerHTML">
      <i class="ion-heart"></i>
      Favorite Article <span class="counter">(3)</span>
    </button>
  </div>
</conduit-article-meta>
```

Les mutations retournent du HTML. Le composant ne recalcule pas son propre etat depuis une reponse JSON.

## Role du Web Component Lit

`<conduit-article-meta>` est un enhancer de HTML serveur.

Responsabilites :

- utiliser le Light DOM via `createRenderRoot() { return this; }` ;
- preserver les classes Conduit et le rendu visuel existant ;
- appeler `window.htmx.process(this)` si necessaire quand le custom element est connecte ;
- gerer un etat busy pendant les requetes HTMX issues de son DOM ;
- desactiver temporairement les boutons pendant la requete ;
- restaurer l'etat apres `htmx:afterRequest`, meme en erreur ;
- intercepter la suppression d'article pour afficher une confirmation avant de laisser HTMX envoyer `hx-delete` ;
- emettre un evenement DOM tel que `conduit:article-meta-updated` apres un swap reussi, pour rendre l'interoperabilite visible et preparer de futurs ponts.

Non-responsabilites :

- ne pas appeler directement l'API RealWorld ;
- ne pas parser de JSON d'article ;
- ne pas lire Zustand ;
- ne pas stocker le JWT ;
- ne pas decider si les boutons Follow/Favorite/Edit/Delete doivent etre visibles.

## Integration SPA

Le fichier du Web Component vit dans la SPA :

- `preact-realworld-example-app/public/webcomponents/conduit-article-meta.ts`

Il est importe depuis :

- `preact-realworld-example-app/public/index.tsx`

Cela permet au bundle SPA existant d'enregistrer le custom element globalement. Go peut alors renvoyer `<conduit-article-meta>` dans ses fragments, et le navigateur upgrade automatiquement les elements quand le script SPA est charge.

`lit` est ajoute aux dependances de `preact-realworld-example-app`.

## Light DOM

Le composant utilise le Light DOM pour garantir un rendu identique :

- les classes CSS globales `article-meta`, `btn`, `btn-sm`, `btn-outline-*`, `author`, `date` restent applicables ;
- les icones `ion-*` restent utilisables sans repliquer de CSS dans un Shadow DOM ;
- la migration est plus lisible pendant la demonstration.

Le Shadow DOM reste un point oral possible pendant la demo, mais il n'est pas retenu pour ce step afin d'eviter un changement visuel et un travail CSS sans valeur pedagogique immediate.

## JWT et authentification

Le token reste hors du DOM.

Le listener global existant conserve son role :

- HTMX declenche `htmx:configRequest` avant chaque requete ;
- la SPA lit le JWT depuis Zustand en memoire ;
- le header `Authorization: Token ...` est ajoute a la requete ;
- Go lit le header et propage le token vers l'API RealWorld.

Le Web Component ne lit pas Zustand et ne recoit pas le token en attribut.

## Delete Article

Le bouton Delete Article est rendu par Go dans le fragment quand l'utilisateur courant est l'auteur.

Le Web Component affiche une confirmation cote client. Si l'utilisateur confirme, la requete HTMX part vers :

- `DELETE /hda/articles/:slug`

Go supprime l'article via l'API RealWorld et renvoie :

- status `200`
- header `HX-Redirect: /`

HTMX effectue alors la navigation vers la home.

## Erreurs

En cas d'echec d'une mutation :

- Go renvoie un statut explicite, par exemple `422`, et un message HTML court ;
- Lit retire toujours le busy state apres `htmx:afterRequest` ;
- le composant ne remplace pas silencieusement l'UI par un etat incorrect ;
- le detail visuel d'erreur reste minimal pour ne pas brouiller la demo.

## Documentation

`MIGRATION_STEP.md` de la branche doit decrire :

- la migration de `ArticleMeta` vers `<conduit-article-meta>` ;
- le role respectif de Preact, Go, HTMX et Lit ;
- la synchronisation des deux occurrences ;
- la raison du Light DOM ;
- la regle JWT hors DOM ;
- les limites connues.

`README.md` doit recevoir une section `Possible Enhancement` qui note un futur step bonus autour de l'authentification et du JWT. Cette section doit expliquer que `step-05` conserve le pont `htmx:configRequest` de `step-04`, mais qu'une prochaine demo pourrait approfondir la gestion auth cote HDA.

## Validation

Commandes attendues :

```bash
cd preact-realworld-example-app && npm run build
cd go-hda-backend && make templ
cd go-hda-backend && go build ./... && go vet ./...
git diff --name-only trunk...HEAD | grep presentation/ && echo "ERREUR" || echo "OK"
```

Validation manuelle attendue sur `http://localhost:1337` :

- ouvrir une page article ;
- verifier que les deux occurrences `ArticleMeta` ont le meme rendu qu'avant ;
- cliquer Favorite/Unfavorite et verifier que les deux occurrences se synchronisent ;
- cliquer Follow/Unfollow et verifier que les deux occurrences se synchronisent ;
- verifier que Delete Article demande confirmation puis redirige vers `/` ;
- verifier que la section commentaires de `step-04` continue a fonctionner.

## Narration de demo

Message principal :

> Jusqu'ici, la migration HDA remplacait des bouts de SPA par des fragments HTML et HTMX. Dans ce dernier step, on montre qu'un composant plus riche peut aussi migrer : le serveur rend toujours l'etat suivant en HTML, HTMX transporte les mutations, et Lit encapsule le comportement reutilisable.

Points a montrer :

- la meme balise `<conduit-article-meta>` est utilisee deux fois ;
- le rendu visuel reste identique ;
- une action sur une occurrence met a jour les deux ;
- les mutations ne renvoient pas de JSON d'etat UI ;
- Lit n'est pas oppose a HDA : il sert d'enrichissement local autour d'un HTML serveur.

## References

- HTMX `hx-target` : https://v1.htmx.org/attributes/hx-target/
- HTMX `hx-swap-oob` : https://htmx.org/attributes/hx-swap-oob/
- HTMX `HX-Redirect` : https://htmx.org/headers/hx-redirect/
- Lit Light DOM : https://lit.dev/docs/components/shadow-dom/
