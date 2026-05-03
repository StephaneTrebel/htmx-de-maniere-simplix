import { cn } from "@/lib/utils";
import UserAvatar from "@/components/profiles/avatar/UserAvatar";
import FollowButton from "@/components/article/singleArticle/FollowButton";
import { EditButton } from "@/components/article/singleArticle/EditButton";
import { DeleteButton } from "@/components/article/singleArticle/DeleteButton";
import FavoriteArticleButton from "@/components/article/singleArticle/FavoriteButton";

export type TSingleArticleActivity = {
	slug: string;
	username: string;
	createdAt: string;
	className?: string;
	following: boolean;
	favorited: boolean;
	favoritesCount: number;
	isCurrentUser: boolean;
};

export const SingleArticleActivity: React.FC<TSingleArticleActivity> = async ({
	slug,
	username,
	createdAt,
	className,
	following,
	favorited,
	isCurrentUser,
	favoritesCount,
}) => {

	return (
		<div
			className={cn(
				`flex flex-col md:flex-row gap-5 md:items-end ${className}`
			)}
		>
			<UserAvatar
				date={createdAt}
				username={username}
				avatarH={9}
				className="text-sm"
			/>
			<div className="flex gap-2 md:mb-1">
				{!isCurrentUser ? (
					<>
						<FollowButton
							username={username}
							following={following}
						/>
						<FavoriteArticleButton
							haveText
							slug={slug}
							favorite={favorited}
							refreshUrl={`/article/${slug}`}
							favoritesCount={favoritesCount}
						/>
					</>
				) : (
					<>
						<EditButton
							slug={slug}
							className="border-gray-400 text-gray-400 hover:bg-gray-500 hover:text-white"
						/>
						<DeleteButton slug={slug} />
					</>
				)}
			</div>
		</div>
	);
};
