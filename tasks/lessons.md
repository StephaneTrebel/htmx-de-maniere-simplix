# Lessons

- Quand l'utilisateur corrige une trajectoire de structuration (ex. dossiers de steps -> branches de steps), ne pas continuer sur l'ancienne hypothèse : reformuler explicitement la nouvelle contrainte, surtout les contraintes fortes comme `presentation/` qui ne doit pas changer pendant les changements de branche.
- Pour ce dépôt, règle absolue : aucun commit des branches `step-*` ne doit modifier `presentation/`. Le deck doit vivre sur une branche/worktree séparé de la pile de migration.
