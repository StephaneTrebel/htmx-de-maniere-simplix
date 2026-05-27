/**
 * Déclarations de types globaux pour la SPA Conduit.
 */

// ── Attributs HTMX ────────────────────────────────────────────────────────────
// Étend les types JSX de Preact pour autoriser les attributs hx-* dans les templates.
// Seuls les attributs utilisés dans ce projet sont déclarés.

declare namespace preact.JSX {
	export interface HTMLAttributes<RefType extends EventTarget = EventTarget> {
		'hx-get'?: string;
		'hx-post'?: string;
		'hx-put'?: string;
		'hx-delete'?: string;
		'hx-trigger'?: string;
		'hx-swap'?: string;
		'hx-target'?: string;
		'hx-push-url'?: string;
		'hx-vals'?: string;
		'hx-indicator'?: string;
		'hx-boost'?: string;
		'hx-select'?: string;
		'hx-headers'?: string;
	}
}
