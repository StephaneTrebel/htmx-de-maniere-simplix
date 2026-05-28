/**
 * Home — step-02-article-feed
 *
 * Migrations effectuées par rapport à step-01 :
 *
 * Avant (step-01) :
 *   - 6 states Preact (articles, articlesCount, isLoading, page, currentActiveTab, tag)
 *   - useEffect fetchFeeds : appel API JSON → setArticles / setArticlesCount
 *   - useEffect conduit:tag → setState (setTag, setCurrentActiveTab, setPage)
 *   - JSX du col-md-9 : tabs + ArticlePreview[n] + Pagination (Preact)
 *
 * Après (step-02) :
 *   - 0 state article — le fragment Go est la source de vérité
 *   - useEffect conduit:tag → htmx.ajax() — pont de 6 lignes, plus de setState
 *   - col-md-9 = un seul point de montage HTMX <div id="article-feed" hx-get="..." />
 *   - tabs, articles, pagination : tous rendus et gérés côté Go (templates/articles.templ)
 *
 * L'utilisateur ne voit aucune différence visuelle.
 */
import { useEffect, useRef } from 'preact/hooks';

import { PopularTags } from '../components/PopularTags';
import { useStore } from '../store';

export default function HomePage() {
	const isAuthenticated = useStore(state => !!state.user);
	const rowRef = useRef<HTMLDivElement>(null);

	// HTMX ne scanne pas automatiquement les éléments ajoutés par le routeur SPA.
	// Quand l'utilisateur revient sur Home depuis une autre page, Preact recrée
	// les deux points de montage HTMX (#article-feed et PopularTags) mais HTMX
	// ne les voit pas — hx-trigger="load" ne se déclencherait jamais.
	// htmx.process() sur le container .row couvre les deux en un seul appel.
	useEffect(() => {
		if (rowRef.current) window.htmx.process(rowRef.current);
	}, []);

	// Pont entre le fragment PopularTags (Go) et le fragment ArticleFeed (Go).
	// Quand l'utilisateur clique un tag dans la sidebar, le fragment Go dispatche
	// "conduit:tag". Ce useEffect capte l'événement et demande à HTMX de recharger
	// le fil d'articles avec le tag sélectionné — sans aucun setState Preact.
	useEffect(() => {
		const handler = (e: Event) => {
			const tag = (e as CustomEvent<string>).detail;
			window.htmx.ajax('GET', `/hda/articles?tab=tag&tag=${encodeURIComponent(tag)}&page=1`, {
				target: '#article-feed',
				swap: 'outerHTML',
			});
		};
		document.addEventListener('conduit:tag', handler);
		return () => document.removeEventListener('conduit:tag', handler);
	}, []);

	return (
		<div class="home-page">
			{!isAuthenticated && (
				<div class="banner">
					<div class="container">
						<h1 class="logo-font">conduit</h1>
						<p>A place to share your knowledge.</p>
					</div>
				</div>
			)}

			<div class="container page">
				<div class="row" ref={rowRef}>
					<div class="col-md-9">
						{/*
						 * Point de montage HTMX — step-02.
						 * HTMX charge GET /hda/articles?tab=global&page=1 au montage
						 * et remplace cet élément par le fragment Go (outerHTML).
						 * Le fragment lui-même contient les onglets et la pagination ;
						 * toute navigation s'effectue ensuite sans JS.
						 */}
						<div
							id="article-feed"
							hx-get="/hda/articles?tab=global&page=1"
							hx-trigger="load"
							hx-swap="outerHTML"
						/>
					</div>

					<div class="col-md-3">
						{/*
						 * PopularTags reste un point de montage HTMX (step-01).
						 * Au clic sur un tag, le fragment dispatche "conduit:tag"
						 * que le useEffect ci-dessus intercepte pour recharger #article-feed.
						 */}
						<PopularTags />
					</div>
				</div>
			</div>
		</div>
	);
}
