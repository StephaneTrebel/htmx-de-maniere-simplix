import axios from "axios";
import { Suspense } from "react";

import Link from "next/link";
import { getSession } from "@/actions";
import { TagList } from "@/components/tag/TagList";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/loading/Loading";
import { Comments } from "@/components/article/comments/Comments";
import { FormattedErrors } from "@/components/error/FormattedErrors";
import { AvatarImg } from "@/components/profiles/avatar/AvatarImage";
import { CommentForm } from "@/components/article/comments/CommentForm";
import SingleArticleHeader from "@/components/article/singleArticle/SingleArticleHeader";
import { SingleArticleActivity } from "@/components/article/singleArticle/SingleArticleActivity";

type TSingleArticleProps = {
	params: {
		slug: string;
	};
};
const SingleArticle: React.FC<TSingleArticleProps> = async ({ params }) => {
	const session = await getSession();

	try {
		const res = await axios.get(
			`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/${params.slug}`,
			{
				headers: {
					Authorization: session.token
						? `Token ${session.token}`
						: undefined,
				},
			}
		);
		const data = await res.data;

		if (data.status === 200) {
			const { article } = await data.data;
			return (
				<>
					<SingleArticleHeader
						slug={params.slug}
						createdAt={article.createdAt}
						favorited={article.favorited}
						username={article.author.username}
						following={article.author.following}
						favoritesCount={article.favoritesCount}
						isCurrentUser={
							session.username === article.author.username
						}
					/>
					<p className="py-5 px-4 md:px-10 lg:px-14 text-lg text-justify">
						{article.body}
					</p>
					<TagList
						tagList={article.tagList}
						className="py-5 px-4 md:px-10 lg:px-14"
					/>
					<div className="py-2 px-4 md:px-10 lg:px-14">
						<Separator />
					</div>
					<Suspense fallback={<Loading width={15} height={15} />}>
						<SingleArticleActivity
							slug={params.slug}
							favorited={article.favorited}
							createdAt={article.createdAt}
							username={article.author.username}
							following={article.author.following}
							favoritesCount={article.favoritesCount}
							isCurrentUser={
								session.username === article.author.username
							}
							className="my-5 mx-3 md:justify-center"
						/>
					</Suspense>

					{session.token ? (
						<>
							<CommentForm
								avatar={
									<AvatarImg
										username={session.username as string}
										className="h-7 w-7"
									/>
								}
								token={session.token as string}
								slug={params.slug}
							/>
							<Comments
								slug={params.slug}
								token={session.token as string}
							/>
						</>
					) : (
						<div className="w-fit mx-auto mb-5">
							<Link
								href="/login"
								className="text-green-custom hover:underline"
							>
								Sign in
							</Link>{" "}
							or{" "}
							<Link
								href="/register"
								className="text-green-custom hover:underline"
							>
								sign up
							</Link>{" "}
							to add comments on this article.
						</div>
					)}
				</>
			);
		} else {
			return (
				<h1 className="text-rose-500 w-fit mx-auto">
					<FormattedErrors
						data={data.data}
						className="ml-5 capitalize"
					/>
				</h1>
			);
		}
	} catch (err) {
		console.log(err);
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};

export default SingleArticle;
