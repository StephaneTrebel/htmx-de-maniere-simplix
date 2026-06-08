import { ReactiveElement } from 'lit';

export class ConduitArticleMeta extends ReactiveElement {
	protected createRenderRoot(): HTMLElement {
		return this;
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.addEventListener('click', this.confirmDelete, true);
		this.addEventListener('htmx:beforeRequest', this.handleBeforeRequest as EventListener);
		this.addEventListener('htmx:afterRequest', this.handleAfterRequest as EventListener);
		queueMicrotask(() => window.htmx?.process(this));
	}

	disconnectedCallback(): void {
		this.removeEventListener('click', this.confirmDelete, true);
		this.removeEventListener('htmx:beforeRequest', this.handleBeforeRequest as EventListener);
		this.removeEventListener('htmx:afterRequest', this.handleAfterRequest as EventListener);
		super.disconnectedCallback();
	}

	private confirmDelete = (event: Event): void => {
		if (!(event.target instanceof Element)) return;

		const deleteButton = event.target.closest('[data-confirm-delete="true"]');
		if (!deleteButton || !this.contains(deleteButton)) return;

		if (!window.confirm('Delete this article?')) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	};

	private handleBeforeRequest = (): void => {
		this.setBusy(true);
	};

	private handleAfterRequest = (): void => {
		this.setBusy(false);
	};

	private setBusy(isBusy: boolean): void {
		if (isBusy) {
			this.setAttribute('aria-busy', 'true');
		} else {
			this.removeAttribute('aria-busy');
		}

		this.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
			button.disabled = isBusy;
		});
	}
}

if (!customElements.get('conduit-article-meta')) {
	customElements.define('conduit-article-meta', ConduitArticleMeta);
}
