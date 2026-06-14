## .[cover]

# HTMX, de manière simplix

Thomas, Stéphane, une SPA Preact, un backend Go, et du HTML qui reprend sa place au centre

!image(assets/realworld-logo.png,Logo RealWorld Example App,420)

/*
Ce n'est pas une conférence "HTMX va tout remplacer" — c'est le récit d'une migration concrète, menée sur une vraie application.
Poser le ton dès le départ : "simplix", pas "simple". On cherche la simplicité praticable, pas la simplification magique.
On va vous montrer du code qui tourne, des patterns qui ont marché, et ce qui reste dur.
*/

## Qui sommes-nous ?

!image(assets/stephane_thomas.webp,portraits,600)

| **Thomas Labarussias**|| **Stéphane Trebel**  |
|-|-|-|
| Staff DevOps/SRE || Freelance 👨‍💻|
| Ex-DevRel || Web Dev 🌍|
| Mainteneur OSS || Rustacé 🦀 |
| Ambassadeur CNCF || Twitch & YouTube 📺|

/*
Présentation rapide. La colonne "Rust" de Stéphane est volontaire — c'est son domaine de prédilection, et oui, il fait quand même du web avec nous aujourd'hui.
Garder court, l'audience est là pour le contenu.
*/

## Le pacte

- Un **vrai cas applicatif** — pas une todo-list 😅
- Une **migration progressive** — pas un "big bang" 💥
- **SPA+JSON** et **HDA+HTML** comparés sur le même terrain 🤝

/*
Trois engagements envers l'audience.
Insister sur "progressive" : l'application tourne en production à chaque step, l'utilisateur ne voit rien.
Le "même terrain" est important : on compare les deux approches sur exactement les mêmes fonctionnalités, pas sur des exemples fabriqués pour avantager l'une ou l'autre.
*/

## Trois mouvements

1. Le point de départ : une **SPA Preact** existante
2. La migration "*strangler fig*" : **fragments HTML** servis par **Go + HTMX**
3. **Conclusions** : ce qui devient simple, ce qui reste dur

/*
Annoncer le plan en trois actes.
Acte 1 : on installe le contexte — l'app, le code, les choix initiaux.
Acte 2 : on migre composant par composant, en montrant le code à chaque étape.
Acte 3 : on assume les conclusions — sans dogme. Si ça ne vaut pas le coup, on le dit.
*/
