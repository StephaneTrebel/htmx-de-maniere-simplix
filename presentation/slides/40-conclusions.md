//@ < TBD

## .[chapter]

# Conclusions

/*
Chapitre 3.
On quitte le récit de migration pour formuler les apprentissages.
Le but est de donner à l'audience une grille de décision, pas une religion technique.
*/

## Ce qui devient plus simple

- Moins d'état client pour les parcours serveur
- Moins de mapping JSON -> DOM
- Des interactions HTTP plus visibles
- Un rendu initial plus proche du produit

/*
Les gains apparaissent quand l'interface est principalement la projection d'un état serveur.
La liste, la pagination, les tags, certains boutons de mutation, les messages d'erreur de formulaires: tout cela peut devenir plus direct.
Le HTML redevient un format d'application, pas seulement le résultat final caché derrière le framework.
*/

## Ce qui ne disparaît pas

- La conception des frontières
- Les cas concurrents
- Les erreurs et validations
- L'historique navigateur
- Les tests end-to-end

/*
Être net: HTMX ne supprime pas la conception logicielle.
Il rend certains chemins plus courts, mais il ne choisit pas pour nous la bonne granularité de fragment, la bonne stratégie d'URL, ou la bonne gestion d'erreur.
Les tests restent indispensables, peut-être même plus importants au début parce que l'équipe change de réflexes.
*/

## Nos heuristiques

1. Migrer d'abord les lectures
2. Remplacer un conteneur cohérent
3. Renvoyer un fragment complet après mutation
4. Garder Preact pour les vraies îles riches
5. Faire du HTML un contrat versionné

/*
Donner les règles pratiques que l'on a envie de conserver.
Les lectures sont des cibles plus sûres.
Un swap doit viser une zone qui peut être rendue de manière autonome.
Après une mutation, le serveur doit renvoyer un état complet, pas un patch mental fragile.
Et il ne faut pas avoir honte de garder Preact là où une interaction très riche le justifie.
*/

## Le vrai changement

> On ne demande plus au navigateur de reconstruire toute l'application à partir de données.

/*
Laisser respirer cette idée.
Le changement de paradigme est là: dans une SPA, le serveur fournit surtout des données et le client reconstitue l'interface.
Dans une application hypermedia, le serveur peut aussi fournir les transitions d'interface sous forme de HTML.
Ce n'est pas un retour en arrière, c'est un rééquilibrage.
*/

## Simplix, pas simpliste

- Simple: moins de couches quand elles n'aident pas
- Explicite: HTTP, HTML, cibles, fragments
- Mixte: accepter plusieurs modèles pendant la migration

/*
Conclure sur le titre.
"Simplix" ne veut pas dire naïf.
La simplicité visée est une simplicité d'exploitation: comprendre le chemin d'un clic, savoir quelle réponse est attendue, remplacer la bonne zone, garder le code lisible.
La migration progressive est importante parce qu'elle permet de découvrir ces règles en contexte réel.
*/

## À retenir

```text
SPA+JSON n'est pas l'ennemi.
HTML+HTMX n'est pas une baguette magique.

Le bon test:
est-ce que le prochain changement produit
sera plus facile à livrer ?
```

/*
Terminer sans dogme.
Le meilleur argument pour HTMX dans cette histoire n'est pas la mode, c'est la capacité à réduire la distance entre une intention utilisateur et le HTML final.
Si cette distance diminue sans rendre les frontières floues, on gagne.
Sinon, on garde l'outil qui marche.
*/
