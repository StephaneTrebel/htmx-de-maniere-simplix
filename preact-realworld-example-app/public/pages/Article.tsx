/**
 * Article — step-05-webcomponent
 *
 * Migrations effectuées par rapport à step-04 :
 *
 * Avant (step-04) :
 *   - ArticleMeta restait un composant Preact local, dupliqué en haut et en bas de page
 *   - follow/favorite/delete passaient encore par des callbacks Preact + API JSON
 *   - les commentaires étaient déjà servis par un fragment Go + HTMX
 *
 * Après (step-05) :
 *   - les deux ArticleMeta deviennent des fragments Go chargés en HTMX
 *   - Go retourne un <conduit-article-meta> rendu côté serveur, enrichi par Lit côté navigateur
 *   - les mutations favorite/follow/delete sont des requêtes HTMX ; les deux occurrences sont
 *     synchronisées via un swap out-of-band
 *   - le JWT reste injecté par htmx:configRequest (index.tsx), jamais dans le DOM
 *
 * Article.tsx reste la coquille SPA : titre, corps Markdown, routing et montage des fragments.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import snarkdown from 'snarkdown';

import { LoadingIndicator } from '../components/LoadingIndicator';
import { apiGetArticle } from '../services/api/article';
import { useStore } from '../store';

interface ArticlePageProps {
	params: {
		slug: string;
	};
}

export default function ArticlePage(props: ArticlePageProps) {
	const [article, setArticle] = useState<Article | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);
	const user = useStore(state => state.user);
	const hdaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		(async function () {
			setIsLoading(true);
			setArticle(await apiGetArticle(props.params.slug));
			setIsLoading(false);
		})();
	}, [props.params.slug]);

	// HTMX ne scanne pas automatiquement les éléments ajoutés par le routeur SPA.
	// Un seul process() sur la page couvre ArticleMeta banner/actions et les commentaires.
	useEffect(() => {
		if (article && hdaRef.current) window.htmx.process(hdaRef.current);
	}, [article, props.params.slug, user?.username, user?.image]);

	const encodedSlug = encodeURIComponent(props.params.slug);
	const currentUsername = encodeURIComponent(user?.username ?? '');
	const articleMetaUrl = (slot: 'banner' | 'actions') =>
		`/hda/articles/${encodedSlug}/meta?slot=${slot}&currentUsername=${currentUsername}`;

	// username et userImage passés en query params pour que Go puisse rendre
	// le formulaire et les boutons delete de façon conditionnelle.
	// Le JWT est injecté automatiquement par le listener htmx:configRequest dans index.tsx.
	const commentsUrl = `/hda/articles/${encodedSlug}/comments`
		+ `?username=${currentUsername}`
		+ `&userImage=${encodeURIComponent(user?.image ?? '')}`;

	return !article ? (
		<LoadingIndicator show={isLoading} style={{ margin: '1rem auto', display: 'flex' }} width="2em" />
	) : (
		<div class="article-page" ref={hdaRef}>
			<div class="banner">
				<div class="container">
					<h1>{article.title}</h1>
					<div
						id="article-meta-banner"
						hx-get={articleMetaUrl('banner')}
						hx-trigger="load"
						hx-swap="outerHTML"
					/>
				</div>
			</div>

			<div class="container page">
				<div class="row article-content">
					<div class="col-xs-12" dangerouslySetInnerHTML={{ __html: snarkdown(article.body) }} />
				</div>

				<hr />

				<div class="article-actions">
					<div
						id="article-meta-actions"
						hx-get={articleMetaUrl('actions')}
						hx-trigger="load"
						hx-swap="outerHTML"
					/>
				</div>

				<div class="row">
					<div class="col-xs-12 col-md-8 offset-md-2">
						<div
							id="comments"
							hx-get={commentsUrl}
							hx-trigger="load"
							hx-swap="innerHTML"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
