/**
 * PopularTags — step-01-go-hda-proxy
 *
 * Ce composant est le premier migré vers le backend Go + HTMX.
 *
 * Avant (SPA pure) :
 *   - useEffect + apiGetAllTags → rendu JSX côté client
 *   - onClick prop pour notifier Home du tag sélectionné
 *
 * Après (HDA) :
 *   - Un simple point de montage : HTMX charge le fragment HTML depuis /hda/tags
 *   - Le fragment Go dispatch un événement DOM "conduit:tag" au clic
 *   - Home.tsx écoute cet événement — aucune prop nécessaire
 *
 * L'utilisateur ne voit aucune différence visuelle.
 */
export function PopularTags() {
	return (
		<div
			hx-get="/hda/tags"
			hx-trigger="load"
			hx-swap="outerHTML"
		/>
	);
}
