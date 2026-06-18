## Step-04 — Commentaires : les premières mutations .[chapter]

Les 3 premiers steps ne faisaient que du `hx-get`.
Step-04 introduit **l'écriture** avec `hx-post` et `hx-delete` :

```html
<!-- Formulaire d'ajout -->
<form hx-post="/hda/articles/{slug}/comments"
      hx-target="#comments" hx-swap="innerHTML">
    <textarea name="body"></textarea>
    <button type="submit">Post Comment</button>
</form>

<!-- Bouton supprimer -->
<button hx-delete="/hda/articles/{slug}/comments/{id}"
        hx-target="#comments" hx-swap="innerHTML">
    🗑
</button>
```

Après chaque mutation, Go re-rend **la liste entière** → toujours cohérente.

/*
La logique de "re-rendre la liste entière" mérite d'être explicitée.
C'est délibéré : le serveur est la source de vérité. Pas de patch client à maintenir, pas d'état intermédiaire fragile.
innerHTML ici (vs outerHTML pour les autres fragments) : le div #comments reste stable entre les réponses — HTMX peut toujours le cibler après un POST ou DELETE.
*/

## Step-04 — JWT sans toucher le DOM

**Problème :** HTMX doit authentifier ses requêtes, mais le token JWT vit dans Zustand (JS).

| Approche |&nbsp;| Token visible dans DevTools ? |
|---|---|---|
| `hx-headers='{"Authorization":"Token xxx"}'` |&nbsp;| **Oui** ⚠️ (attribut HTML, DOM, logs…) |
| `htmx:configRequest` |&nbsp;| **Non** ✅ (mémoire JS uniquement) |

```ts
// index.tsx — une seule fois, couvre toute l'app
document.addEventListener('htmx:configRequest', (e) => {
    const token = useStore.getState().user?.token;
    if (token) {
        e.detail.headers['Authorization'] = `Token ${token}`;
    }
});
```

/*
htmx:configRequest se déclenche juste avant chaque requête HTMX — c'est le point d'injection idéal.
hx-headers écrirait le token dans le DOM : visible dans l'inspecteur d'éléments, dans les logs, potentiellement dans des screenshots de support.
Ici le token reste en mémoire Zustand. Une seule ligne dans index.tsx couvre tous les fragments actuels et futurs.
*/
