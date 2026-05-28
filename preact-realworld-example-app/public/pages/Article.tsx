/**
 * Article — step-04-comments
 *
 * Migrations effectuées par rapport à step-03 :
 *
 * Avant (step-03) :
 *   - 4 states Preact (article, comments, commentBody, isLoading)
 *   - useEffect : apiGetComments → setComments
 *   - postComment : apiCreateComment → setComments
 *   - ArticleCommentCard avec onDelete callback → setComments
 *   - JSX : formulaire + liste de commentaires gérés en Preact
 *
 * Après (step-04) :
 *   - 2 states (article, isLoading) — les commentaires sont la responsabilité du fragment Go
 *   - Point de montage HTMX <div id="comments" hx-get="..." hx-trigger="load" hx-swap="innerHTML">
 *   - JWT injecté via htmx:configRequest (index.tsx) — jamais exposé dans le DOM
 *   - username et userImage passés en query param pour que Go puisse rendre le formulaire
 *     et les boutons delete de façon conditionnelle
 *
 * L'utilisateur ne voit aucune différence visuelle.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import snarkdown from 'snarkdown';

import { ArticleMeta } from '../components/ArticleMeta';
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
	const commentsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		(async function () {
			setIsLoading(true);
			setArticle(await apiGetArticle(props.params.slug));
			setIsLoading(false);
		})();
	}, [props.params.slug]);

	// Même pattern que Home.tsx : HTMX ne scanne pas les éléments ajoutés
	// par le routeur SPA. htmx.process() sur le conteneur #comments déclenche
	// le hx-trigger="load" après une navigation SPA vers cette page.
	useEffect(() => {
		if (commentsRef.current) window.htmx.process(commentsRef.current);
	}, [article]);

	// username et userImage passés en query params pour que Go puisse rendre
	// le formulaire et les boutons delete de façon conditionnelle.
	// Le JWT est injecté automatiquement par le listener htmx:configRequest dans index.tsx.
	const commentsUrl = `/hda/articles/${encodeURIComponent(props.params.slug)}/comments`
		+ `?username=${encodeURIComponent(user?.username ?? '')}`
		+ `&userImage=${encodeURIComponent(user?.image ?? '')}`;

	return !article ? (
		<LoadingIndicator show={isLoading} style={{ margin: '1rem auto', display: 'flex' }} width="2em" />
	) : (
		<div class="article-page">
			<div class="banner">
				<div class="container">
					<h1>{article.title}</h1>
					<ArticleMeta article={article} />
				</div>
			</div>

			<div class="container page">
				<div class="row article-content">
					<div class="col-xs-12" dangerouslySetInnerHTML={{ __html: snarkdown(article.body) }} />
				</div>

				<hr />

				<div class="article-actions">
					<ArticleMeta article={article} />
				</div>

				<div class="row">
					<div class="col-xs-12 col-md-8 offset-md-2">
						{/*
						 * Point de montage HTMX — step-04.
						 * hx-swap="innerHTML" : le div reste dans le DOM entre les requêtes.
						 * Le JWT est injecté par htmx:configRequest (index.tsx), pas ici.
						 */}
						<div
							id="comments"
							ref={commentsRef}
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
