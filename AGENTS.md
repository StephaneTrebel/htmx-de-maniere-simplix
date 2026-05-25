# AGENTS.md — Vision et règles du dépôt

Ce fichier s'applique à l'ensemble du dépôt.

## Mission du dépôt

Ce dépôt sert de support à une démonstration pédagogique de migration progressive d'une application RealWorld depuis une architecture **SPA + API JSON** vers une application **HDA** (*Hypermedia Driven Application*) servie principalement en **HTML côté serveur avec Go**, enrichie avec **HTMX** et des **Web Components Lit**.

L'objectif n'est pas de réécrire tout d'un coup. L'objectif est de montrer, étape par étape, comment une équipe peut faire évoluer une application existante vers une architecture HTML-first.

- État initial : SPA Preact dans `preact-realworld-example-app/`.
- État cible : application totalement ou majoritairement HDA.
- Les contenus fonctionnels de l'application RealWorld peuvent rester en anglais.
- Les consignes projet, notes de migration et documents de présentation doivent rester en français.

## Structure applicative attendue

Les couches de la stack doivent rester distinctes.

- `preact-realworld-example-app/` : application SPA Preact existante. Elle sert de point de départ et doit être modifiée progressivement.
- `go-hda-backend/` : backend Go qui sert le contenu HTML/HDA.
- `reverse-proxy/` : reverse proxy distinct, responsable du routage entre SPA et HDA.
- `presentation/` : deck SliDesk de la conférence. Voir la règle absolue plus bas avant toute modification.

Ne pas créer de système de dossiers `steps/` ni de scripts de patch pour matérialiser les étapes, sauf demande explicite ultérieure. La progression de la migration est portée par les branches Git `step-*`.

## Branches de migration

La migration applicative est une pile stricte et linéaire de branches :

1. `step-00-spa-json`
   - État initial SPA + JSON.
   - Sert de référence pour comparer le comportement, les routes, l'UX et les échanges API.

2. `step-01-go-hda-proxy`
   - Ajoute `go-hda-backend/`:
      - un backend http en `Go`, utilisant `Echo` comme framework et `templ` pour générer les pages html
   - Ajoute `reverse-proxy/`.
      - un traefik faisant le routing vers le backend `Go` ou `Preact` en fonction de la présence des headers `HTMX`
   - Pose la fondation permettant de servir soit la SPA, soit le contenu HDA.
   - Le routage entre SPA et HDA se fera selon des headers à définir dans cette étape ou dans une décision documentée.

3. `step-02-*` à `step-0n-*`
   - Chaque branche migre un composant ou un ensemble cohérent de composants.
   - Les premiers composants ne sont pas encore figés.
   - Chaque étape doit être petite, démontrable et compréhensible pendant la conférence.

Chaque branche `step-N` doit être construite à partir de `step-(N-1)`. Ne pas sauter d'étape, ne pas mélanger plusieurs jalons, et ne pas anticiper les composants des étapes suivantes tant qu'ils ne sont pas décidés.

## Règle absolue pour `presentation/`

**Aucun commit d'une branche `step-*` ne doit modifier `presentation/`.**

Cette règle est intentionnelle et non négociable : pendant la démonstration, le deck doit rester affichable et stable pendant que l'on change de branche applicative.

Conséquences :

- Les branches `step-*` concernent uniquement la migration applicative.
- Le deck SliDesk doit être maintenu sur une branche ou dans un worktree séparé, par exemple une branche dédiée `presentation`.
- Si un jalon applicatif nécessite une mise à jour du deck, faire cette mise à jour hors de la branche `step-*`.
- Avant de terminer un travail sur une branche `step-*`, vérifier explicitement que `presentation/` n'apparaît pas dans le diff ni dans les commits du step.

## Documentation par étape

Chaque branche `step-*` doit contenir un fichier racine `MIGRATION_STEP.md`.

Ce fichier décrit l'état de la branche courante, pas tout l'historique de la migration. Il peut donc changer d'une branche à l'autre.

Contenu attendu :

- nom de la branche ;
- objectif du step ;
- différence avec le step précédent ;
- dossiers et applications modifiés ;
- commandes de lancement ;
- commandes de vérification ;
- point narratif à montrer pendant la démo ;
- limites connues et ce qui reste côté SPA.

## Règles de migration applicative

- Préserver `preact-realworld-example-app/` comme source de vérité initiale de la SPA.
- Modifier la SPA uniquement de façon progressive, composant par composant ou zone par zone.
- Pour les étapes `step-02-*` et suivantes, migrer un composant ou ensemble cohérent vers une version HTML + HTMX servie par `go-hda-backend/`.
- Utiliser Lit pour créer ou encapsuler les Web Components nécessaires à l'intégration progressive.
- Garder le reverse proxy comme couche séparée de `go-hda-backend/`.
- Éviter les refontes massives ou les changements opportunistes qui brouillent la narration de migration.
- Documenter toute décision structurante dans `MIGRATION_STEP.md`.

## Validation attendue

Avant de considérer un step terminé :

- lancer les vérifications pertinentes pour la SPA, par exemple dans `preact-realworld-example-app/` : `npm run build` ;
- lancer les tests ou builds Go quand `go-hda-backend/` existera ;
- lancer les tests ou builds du proxy quand `reverse-proxy/` existera ;
- vérifier que `MIGRATION_STEP.md` décrit bien le step courant ;
- vérifier qu'aucun changement de la branche `step-*` ne touche `presentation/`.

Si aucune vérification automatisée n'existe encore pour une couche donnée, le dire explicitement dans `MIGRATION_STEP.md` au lieu de prétendre que le step est entièrement validé.
