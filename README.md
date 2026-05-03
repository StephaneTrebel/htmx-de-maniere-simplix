# À propos

Ce dépôt contient le code de la conférence-université "HTMX, de manière simplix !"

## Résumé

On a beaucoup parlé d'HTMX, maintenant, il serait temps de s'y mettre. Et c'est exactement ce que Thomas et moi avons fait !
Nous nous sommes mis à la place d'une équipe technique qui décide d'effectuer une migration d'une application SPA (React, Angular, etc.) vers une "Hypermedia Driven Application", grâce à HTMX (https://htmx.org) !

**À qui ça s'adresse**:

À qui s'intéresse au développement Web, aux frameworks FrontEnd, ou bien au contraire qui avait fait une croix sur tout ça parce que "c'est devenu trop compliqué". Bonne nouvelle ! Non seulement ça ne l'est pas, mais en plus on va vous expliquer pourquoi !

**Plan**:

- On part d'un exemple concret, un bon vieux CRUD implémenté en React (https://github.com/mutoe/preact-realworld-example-app), et on migre progressivement ce paradigme SPA+JSON vers une version HDA+HTMX
- Point de ToDo-List simpliste ici, on va prendre un vrai cas métier: un clone de Medium, le site de gestion/publication d'articles de blog : https://realworld-docs.netlify.app/
- Comment qu'on migre ? Graduellement ! On va Jouer sur le Content-Type pour renvoyer soit du JSON, soit du HTML, ce qui nous permettra de jouer sur les deux tableaux afin de comparer les deux approches. On prendra donc un ensemble de composants plus ou moins complexes pour les convertir.
- À chaque étape, on aborde un aspect du développement Web et ses conséquences : SPA vs HDA, WebComponents, la gestion des APIs des "Back-For-Front" et la transition JSON->HTML
- La grande force des SPA, ce sont leurs composants "réactifs". Voyons comment on a fait la même chose avec https://lit.dev/ pour créer des WebComponents équivalents, notamment grâce à HTMX

## Étapes

À définir 😉
