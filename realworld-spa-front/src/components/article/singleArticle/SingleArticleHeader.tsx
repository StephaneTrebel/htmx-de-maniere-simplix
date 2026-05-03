import {
	SingleArticleActivity,
	TSingleArticleActivity,
} from "@/components/article/singleArticle/SingleArticleActivity";

const SingleArticleHeader: React.FC<TSingleArticleActivity> = async ({
	slug,
	username,
	createdAt,
	following,
	favorited,
	className,
	isCurrentUser,
	favoritesCount,
}) => {
	return (
		<div className="min-w-full py-2 px-4 md:px-10 lg:px-14 flex flex-col gap-5 bg-black-custom shadow-custom text-white">
			<h1 className="md:text-5xl mx-auto w-fit h-fit">{slug}</h1>
			<SingleArticleActivity
				slug={slug}
				username={username}
				createdAt={createdAt}
				following={following}
				favorited={favorited}
				className={className}
				favoritesCount={favoritesCount}
				isCurrentUser={isCurrentUser}
			/>
		</div>
	);
};

export default SingleArticleHeader;
