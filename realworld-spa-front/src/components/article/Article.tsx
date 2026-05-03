import Link from "next/link";

import { TagList } from "@/components/tag/TagList";
import { Separator } from "@/components/ui/separator";
import { sourceSansProExtraLight } from "@/lib/font-loader";
import UserAvatar from "@/components/profiles/avatar/UserAvatar";
import FavoriteArticleButton from "@/components/article/singleArticle/FavoriteButton";

type TArticleProps = {
	date: string;
	slug: string;
	title: string;
	username: string;
	tagList: string[];
	favorited: boolean;
	description: string;
	favoritesCount: number;
};

export const Article: React.FC<TArticleProps> = ({
	date,
	slug,
	title,
	username,
	tagList,
	favorited,
	description,
	favoritesCount,
}) => {
	return (
		<div className="flex flex-col gap-4 group/item my-4">
			<div className="flex justify-between items-center">
				<UserAvatar
					date={date}
					avatarH={9}
					username={username}
					className="text-sm justify-center"
				/>
				<FavoriteArticleButton
					slug={slug}
					haveText={false}
					favorite={favorited}
					favoritesCount={favoritesCount}
					refreshUrl="/"
				/>
			</div>
			<Link href={`/article/${slug}`}>
				<h1 className="text-2xl font-bold">{title}</h1>
				<h2
					className={`text-zinc-400 ${sourceSansProExtraLight} font-extralight`}
				>
					{description}
				</h2>
			</Link>
			<div className="flex justify-between items-center p-0 m-0">
				<Link href={`/article/${slug}`}>
					<span className="text-sm text-zinc-400">Read more...</span>
				</Link>
				<TagList
					tagList={tagList}
					isClickable={true}
					innerClassName="cursor-pointer"
					className="py-1"
				/>
			</div>
			<Separator className="group-last/item:invisible" />
		</div>
	);
};
