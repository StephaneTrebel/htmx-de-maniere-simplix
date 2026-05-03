import { Suspense } from "react";

import axios from "axios";

import { getParams } from "@/lib/get-params";

import { getSession } from "@/actions";
import { Loading } from "@/components/loading/Loading";
import { ArticleList } from "@/components/home/ArticleList";
import ProfileHeader from "@/components/profiles/ProfileHeader";
import { ArticleHeader } from "@/components/home/ArticleHeader";
import { FormattedErrors } from "@/components/error/FormattedErrors";

type TProfilePageProps = {
	params: { username: string };
	searchParams: { [key: string]: string | number | undefined };
};

export default async function ProfilePage(props: TProfilePageProps) {
	const session = await getSession();

	let { page, offset, tag, limit, author, favorited, feed } = getParams(
		props.searchParams
	);

	try {
		const res = await axios.get(
			`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/profiles/${props.params.username}`,
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
			const { profile } = await data.data;
			return (
				<div className="">
					<ProfileHeader profile={profile} session={session} />
					<div className="min-w-full py-2 px-4 md:px-10 lg:px-14 mt-10">
						<ArticleHeader
							choices={[
								{
									name: "My Articles",
									query: `author=${
										author ? author : props.params.username
									}`,
								},
								{
									name: "Favorited Posts",
									query: `favorited=${
										favorited
											? favorited
											: props.params.username
									}`,
								},
							]}
						/>
						<Suspense fallback={<Loading height={5} width={5} />}>
							<ArticleList
								tag={tag}
								page={page}
								feed={feed}
								limit={limit}
								offset={offset}
								author={author ? author : props.params.username}
								favorited={favorited}
								token={session.token as string}
							/>
						</Suspense>
					</div>
				</div>
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
}
