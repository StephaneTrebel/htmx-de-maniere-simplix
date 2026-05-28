/**
 * Profile — step-03-profile
 *
 * Migrations effectuées par rapport à step-02 :
 *
 * Avant (step-02) :
 *   - 5 states (user, articles, articlesCount, page, isLoading)
 *   - useEffect fetchArticles : appel API JSON → setArticles / setArticlesCount
 *   - JSX articles : onglets + ArticlePreview[n] + Pagination (Preact)
 *
 * Après (step-03) :
 *   - 1 state (user — conservé pour le header : avatar, bio, Follow/Unfollow)
 *   - useEffect [url, username] → htmx.ajax() — recharge le fragment articles
 *     au montage ET lors de navigations vers /@username/favorites
 *   - <div id="profile-articles"> = point de montage; Go rend tabs + articles + pagination
 *
 * Ce qui reste en Preact (intentionnel) :
 *   - Header de profil (avatar, bio, username)
 *   - Bouton Follow/Unfollow et lien "Edit Profile Settings"
 *   Ces éléments nécessitent l'état d'authentification et des mutations API —
 *   ils seront migrés dans un step ultérieur dédié à l'authentification.
 *
 * Nouveau concept introduit :
 *   Le fragment est paramétré par un identifiant de ressource issu du routeur
 *   Preact (username depuis /:username, type depuis l'URL). Le composant sert
 *   de pont entre le routeur SPA et le fragment Go.
 */
import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';

import { Link } from '../components/Link';
import { apiFollowProfile, apiUnfollowProfile, apiGetProfile } from '../services/api/profile';
import { useStore } from '../store';
import { DEFAULT_AVATAR } from '../utils/constants';

interface ProfileProps {
	params: {
		username: string;
	};
}

export default function ProfilePage(props: ProfileProps) {
	const username = props.params.username.replace(/^@/, '') || '';
	const { url } = useLocation();
	const [user, setUser] = useState({} as Profile);
	const currentUser = useStore(state => state.user);

	const onFollowUser = async () => {
		if (user.following) {
			setUser(prev => ({ ...prev, following: false }));
			await apiUnfollowProfile(username);
		} else {
			setUser(prev => ({ ...prev, following: true }));
			await apiFollowProfile(username);
		}
	};

	// Le header de profil est encore côté Preact — données publiques mais
	// le bouton Follow/Unfollow a besoin de l'état auth.
	useEffect(() => {
		(async function fetchProfile() {
			setUser(await apiGetProfile(username));
		})();
	}, [username]);

	// Pont entre le routeur Preact et le fragment Go.
	// Se déclenche au montage (chargement initial) et quand l'URL change
	// (navigation entre /@username et /@username/favorites).
	// Le type "author"/"favorited" est déduit de l'URL courante.
	useEffect(() => {
		const type = /.*\/favorites/.test(url) ? 'favorited' : 'author';
		window.htmx.ajax(
			'GET',
			`/hda/profile/articles?username=${encodeURIComponent(username)}&type=${type}&page=1`,
			{ target: '#profile-articles', swap: 'outerHTML' }
		);
	}, [url, username]);

	return (
		<div class="profile-page">

			{/* ── Header de profil — conservé en Preact (step-03) ──────────────
			    Avatar, bio et bouton Follow/Unfollow restent côté client.
			    Le bouton nécessite l'état auth (currentUser) et des mutations API.
			    Migration prévue dans un step ultérieur dédié à l'authentification. */}
			<div class="user-info">
				<div class="container">
					<div class="row">
						<div class="col-xs-12 col-md-10 offset-md-1">
							<img src={user.image || DEFAULT_AVATAR} class="user-img" />
							<h4>{username}</h4>
							<p>{user.bio}</p>
							{username === currentUser?.username ? (
								<Link href="/settings" class="btn btn-sm btn-outline-secondary action-btn">
									<i class="ion-gear-a" /> Edit Profile Settings
								</Link>
							) : (
								<button class="btn btn-sm btn-outline-secondary action-btn" onClick={onFollowUser}>
									<i class="ion-plus-round" /> {user.following ? 'Unfollow' : 'Follow'} {username}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			<div class="container">
				<div class="row">
					<div class="col-xs-12 col-md-10 offset-md-1">
						{/*
						 * Point de montage HTMX — step-03.
						 * Le useEffect ci-dessus charge GET /hda/profile/articles au montage
						 * et à chaque changement d'URL. Le fragment Go prend le relais :
						 * onglets My Articles / Favorited + liste + pagination sont auto-rafraîchissants.
						 */}
						<div id="profile-articles" />
					</div>
				</div>
			</div>
		</div>
	);
}
