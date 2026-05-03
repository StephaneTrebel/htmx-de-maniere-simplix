import axios from "axios";

import { Article } from "@/components/article/Article";
import { FormattedErrors } from "@/components/error/FormattedErrors";
import { PaginationComponent } from "@/components/home/PaginationComponent";

type TArticleListProps = {
	feed: any;
	page: number;
	token: string;
	tag: string | undefined;
	limit: number | undefined;
	offset: number | undefined;
	author: string | undefined;
	favorited: string | undefined;
};

export const ArticleList: React.FC<TArticleListProps> = async ({
	tag,
	page,
	feed,
	limit,
	token,
	offset,
	author,
	favorited,
}) => {

	try {
		const res =
			feed == 1
				? await axios.get(
						`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/feed/?
			limit=${limit}&offset=${offset}
			${tag ? `&tag=${tag}` : ""}
			${author ? `&author=${author}` : ""}
			${favorited ? `&favorited=${favorited}` : ""}`,
						{
							headers: {
								Authorization: token
									? `Token ${token}`
									: undefined,
							},
						}
				  )
				: await axios.get(
						`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/?
			limit=${limit}&offset=${offset}
			${tag ? `&tag=${tag}` : ""}
			${author ? `&author=${author}` : ""}
			${favorited ? `&favorited=${favorited}` : ""}`,
						{
							headers: {
								Authorization: token
									? `Token ${token}`
									: undefined,
							},
						}
				  );

		const data = await res.data;
		if (data.status === 200) {
			const { articles, articlesCount } = await data.data;
			return (
				<>
					{articlesCount > 0 ? (
						<>
							<div className="my-5">
								{articles.map((article: any, i: number) => (
									<Article
										key={i}
										slug={article.slug}
										title={article.title}
										date={article.updatedAt ? article.updatedAt : article.createdAt}
										description={article.description}
										username={article.author.username}
										favorited={article.favorited}
										favoritesCount={article.favoritesCount}
										tagList={article.tagList}
									/>
								))}
							</div>
							<PaginationComponent
								page={page}
								offset={offset as number}
								articlesCount={articlesCount}
							/>
						</>
					) : (
						<h1 className="w-fit mx-auto my-5">
							No article found with given parameter
						</h1>
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
		//console.log(err);
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};
