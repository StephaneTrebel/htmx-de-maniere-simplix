"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { favoriteArticle, unFavoriteArticle } from "@/actions";

type TFavoriteArticleButtonProps = {
	slug: string;
	favorite: boolean;
	haveText: boolean;
	refreshUrl: string;
	favoritesCount: number;
};
const FavoriteArticleButton: React.FC<TFavoriteArticleButtonProps> = ({
	slug,
	favorite,
	haveText,
	refreshUrl,
	favoritesCount,
}) => {
	return (
		<Button
			variant="link"
			onClick={
				favorite
					? async () => await unFavoriteArticle(slug, refreshUrl)
					: async () => await favoriteArticle(slug, refreshUrl)
			}
			className={cn(
				"m-0 px-2 py-1 h-fit text-xs md:text-sm flex gap-1 bg-transparent  border border-green-custom text-green-custom underline-offset-0 hover:no-underline hover:bg-green-custom hover:text-white",
				favorite &&
					"bg-green-custom text-white hover:bg-transparent hover:text-green-custom"
			)}
		>
			<Heart height={15} width={15} />
			<span>
				{haveText
					? favorite
						? `UnFavorite Article (${favoritesCount})`
						: `Favorite Article (${favoritesCount})`
					: favoritesCount}
			</span>
		</Button>
	);
};

export default FavoriteArticleButton;
