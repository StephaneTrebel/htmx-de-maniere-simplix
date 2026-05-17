## .[cover]

# HTMX, de manière simplix

Thomas, Stéphane, une SPA Preact, un backend Go, et du HTML qui revient au centre.

!image(assets/realworld-logo.png,Logo RealWorld Example App,420)

/*
Ouvrir en posant le cadre: ce n'est pas une conférence "HTMX va tout remplacer".
C'est le récit d'une migration volontairement concrète, menée avec Thomas, sur un vrai exemple d'application.
On part d'une SPA Preact existante, on garde ce qui fonctionne, et on introduit progressivement un backend Go capable de rendre des fragments HTML et des WebComponents côté serveur.
Le mot "simplix" donne le ton: chercher la simplicité praticable, pas la simplification magique.
*/

## Le pacte

- Un vrai cas applicatif, pas une todo-list
- Une migration progressive, pas une réécriture héroïque
- Comparer SPA+JSON et HDA+HTML sur le même terrain

/*
Dire que le sujet devient intéressant parce qu'on ne change pas seulement une librairie.
On change le contrat entre le navigateur et le serveur.
La promesse n'est pas "moins de JavaScript partout", mais "moins de JavaScript là où il ne porte pas assez de valeur".
Le terrain commun permet aussi d'éviter les débats abstraits: quand un bouton favori, une pagination, ou une liste de tags doit marcher, on voit vite où chaque approche aide ou complique.
*/

## Trois mouvements

1. A Realworld SPA application
2. WebComponents rendus par Go, strangler fig, HTMX
3. Conclusions: ce qui devient simple, ce qui reste dur

/*
Annoncer les trois chapitres.
Le premier installe le domaine et le point de départ technique.
Le deuxième raconte l'expérience de migration: découpage, rendu serveur, cohabitation avec Preact, HTMX pour les interactions.
Le troisième assume les conclusions: les bénéfices, les coûts, les limites, et les heuristiques qu'on garderait pour un prochain projet.
*/
