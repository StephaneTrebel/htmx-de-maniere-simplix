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

// ── API HTMX exposée sur window ───────────────────────────────────────────────
// Utilisée en step-02 pour déclencher programmatiquement un rechargement du
// fragment #article-feed quand l'événement "conduit:tag" est reçu de PopularTags.
interface HtmxAjaxOptions {
	target?: string | Element;
	swap?: string;
	values?: Record<string, string>;
	headers?: Record<string, string>;
}

interface HtmxConfigRequestDetail {
	headers: Record<string, string>;
	parameters: Record<string, string>;
	unfilteredParameters: Record<string, string>;
	target: Element;
	verb: string;
	elt: Element;
}

interface Htmx {
	ajax(method: string, url: string, options?: HtmxAjaxOptions | string | Element): void;
	process(element: Element): void;
}

interface DocumentEventMap {
	'htmx:configRequest': CustomEvent<HtmxConfigRequestDetail>;
}

interface Window {
	htmx: Htmx;
}
