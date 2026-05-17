//@ < TBD

## .[chapter]

# A Realworld SPA application

/*
Chapitre 1.
L'objectif est de montrer que RealWorld est volontairement plus riche qu'un exemple jouet.
On veut que l'audience voie le produit avant la technique: des articles, des auteurs, des profils, des commentaires, des favoris, de la pagination, de l'authentification.
*/

## RealWorld, le terrain de jeu

- Un clone de Medium
- Un front interchangeable
- Une API commune
- Des parcours CRUD complets

/*
RealWorld se présente comme une famille d'applications de démonstration construites autour du même produit et de la même API.
Le point utile pour nous: on peut comparer des stacks différentes sans changer le domaine.
Dans notre dépôt, le point de départ est `preact-realworld-example-app`, une implémentation Preact qui consomme l'API publique RealWorld.
*/

## Ce que l'application sait faire

- Lire des flux d'articles
- Filtrer par tag, auteur, favoris
- S'authentifier
- Publier et éditer
- Commenter
- Favoriser

/*
Faire le tour fonctionnel rapidement.
Insister sur le fait que ce sont des gestes classiques d'une application métier: listes, détails, formulaires, droits, erreurs, pagination, état local, rechargement partiel.
Ce sont exactement ces gestes qui permettent de juger une architecture front.
*/

## Anatomie du point de départ

```text
public/pages       -> routes Preact
public/components  -> composants UI
public/services    -> client JSON
public/store       -> état utilisateur
```

/*
Relier les dossiers au code lu dans le dépôt.
`Home.tsx` orchestre les onglets, la page courante, le tag actif, le chargement et les appels réseau.
`ArticlePreview.tsx` porte sa propre interaction de favori.
`PopularTags.tsx` récupère les tags puis les expose au parent.
`Pagination.tsx` est un composant pur qui appelle `setPage`.
On a donc un bon mélange de rendu, d'état local, d'état global et de contrat HTTP JSON.
*/

## Le cycle SPA classique

```text
clic utilisateur
  -> setState / store
  -> fetch JSON
  -> setState
  -> render Preact
```

/*
Ne pas caricaturer la SPA.
Ce modèle fonctionne bien: il est familier, il donne des composants testables, il rend les interactions locales naturelles.
Mais il impose aussi que le navigateur sache reconstruire l'interface à partir de JSON.
La migration va donc poser une question simple: est-ce que ce travail appartient toujours au client ?
*/

## Exemple: la home

- `currentActiveTab`
- `tag`
- `page`
- `isLoading`
- `articles`
- `articlesCount`

/*
Décrire la home comme une petite machine à états.
Elle n'est pas énorme, mais elle concentre déjà plusieurs décisions: quel flux charger, avec quels paramètres, comment signaler le chargement, comment vider ou remplir la liste, comment synchroniser la pagination.
Ce sera une bonne cible de migration car on peut déplacer une partie de cette mécanique vers des fragments HTML servis par le backend.
*/

## Exemple: ArticlePreview

```text
props.article
  -> état local
  -> POST/DELETE favorite
  -> nouvel article JSON
  -> nouveau rendu
```

/*
Le bouton favori est un bon candidat parce que son périmètre est petit et visible.
Aujourd'hui le composant reçoit un article, garde une copie locale, appelle l'API favorite ou unfavorite, puis remplace son état avec la réponse JSON.
Côté HTML+HTMX, la même interaction peut devenir: le bouton appelle le serveur, le serveur répond avec le fragment du bouton ou de la carte, HTMX remplace la cible.
*/

## Le contrat de départ

```text
GET /api/articles?page=1
Accept: application/json

{
  "articles": [...],
  "articlesCount": 42
}
```

/*
Mettre en évidence le contrat JSON.
Il est excellent pour la composition entre clients différents.
Mais pour une application web, le JSON n'est pas l'interface finale: il faut encore le transformer en DOM, gérer l'état transitoire, choisir la cible de mise à jour, et maintenir le code de rendu côté client.
Notre migration ne supprime pas les contrats: elle en change la granularité et parfois le format.
*/
