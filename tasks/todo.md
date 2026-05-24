# Todo

## Créer le AGENTS.md racine

- [x] Clarifier la vision du dépôt et la langue des consignes
- [x] Valider la stratégie de branches `step-*`
- [x] Valider la séparation stricte de `presentation/`
- [x] Rédiger `AGENTS.md` à la racine
- [x] Relire le fichier pour cohérence et absence d'ambiguïté
- [x] Documenter le résultat

## Next steps

- [ ] Relire `AGENTS.md` et ajuster le ton ou le niveau de contrainte si nécessaire.
- [ ] Créer la branche `step-00-spa-json` pour matérialiser l'état initial SPA + JSON.
- [ ] Ajouter un `MIGRATION_STEP.md` racine sur `step-00-spa-json` décrivant l'état initial.
- [ ] Créer la branche `step-01-go-hda-proxy` à partir de `step-00-spa-json`.
- [ ] Initialiser `go-hda-backend/` sur `step-01-go-hda-proxy`.
- [ ] Initialiser `reverse-proxy/` sur `step-01-go-hda-proxy`.
- [ ] Ajouter/mettre à jour `MIGRATION_STEP.md` sur `step-01-go-hda-proxy`.
- [ ] Vérifier à chaque step qu'aucun commit ne modifie `presentation/`.

## Review

- `AGENTS.md` créé à la racine en français.
- La vision SPA+JSON vers HDA Go/HTMX/Lit est explicitée.
- La pile de branches `step-*` est définie.
- La règle absolue interdisant toute modification de `presentation/` dans les branches `step-*` est documentée.
- Les prochaines actions ont été ajoutées pour reprendre proprement la session suivante.
