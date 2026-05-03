import { Suspense } from "react";

import { Metadata } from "next";

import { getSession } from "@/actions";
import { getParams } from "@/lib/get-params";
import { Header } from "@/components/home/Header";
import { Loading } from "@/components/loading/Loading";
import { PopularTag } from "@/components/tag/PopularTag";
import { ArticleList } from "@/components/home/ArticleList";
import { ArticleHeader } from "@/components/home/ArticleHeader";

export const metadata: Metadata = {
	title: "Home — Conduit",
	description:
		"Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. home page of conduit",
};

export default async function Home({
	searchParams,
}: {
	searchParams: { [key: string]: string | number | undefined };
}) {
	const session = await getSession();

	const { page, offset, tag, limit, author, favorited, feed } =
		getParams(searchParams);

	const articleHeaderElements = [
		{
			name: "Global Feed",
			query: ``,
		},
	];

	if (session.isLoggedIn) {
		articleHeaderElements.unshift({
			name: "Your Feed",
			query: `feed=1`,
		});
	}

	return (
		<main>
			<Header />
			<div className="min-w-full flex flex-col gap-5 md:flex-row  py-2 px-4 md:px-10 lg:px-14 mt-10">
				<div className="flex-1">
					<ArticleHeader choices={articleHeaderElements} />
					<Suspense fallback={<Loading height={5} width={5} />}>
						<ArticleList
							tag={tag}
							page={page}
							feed={feed}
							limit={limit}
							offset={offset}
							author={author}
							favorited={favorited}
							token={session.token as string}
						/>
					</Suspense>
				</div>
				<Suspense fallback={<Loading height={5} width={5} />}>
					<PopularTag />
				</Suspense>
			</div>
		</main>
	);
}
