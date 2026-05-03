import axios from "axios";

import { getSession } from "@/actions";
import { NewArticle } from "@/components/editor/NewArticle";
import { FormattedErrors } from "@/components/error/FormattedErrors";

type TEditorPageProps = {
	params: {
		slug: string;
	};
};

const EditorPage: React.FC<TEditorPageProps> = async ({ params }) => {
	const session = await getSession();

	if (params.slug === "new") {
		return (
			<div className="flex flex-col gap-3 mx-5 md:mx-auto md:w-4/5 lg:w-3/5">
				<NewArticle token={session.token as string} />
			</div>
		);
	} else {
		try {
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/${params.slug}`,
				{
					headers: {
						Authorization: `Token ${session.token}`,
					},
				}
			);
			const data = await res.data;

			if (data.status === 200) {
				const { article } = await data.data;
				return (
					<div className="flex flex-col gap-3 mx-5 md:mx-auto md:w-4/5 lg:w-3/5">
						<NewArticle
							token={session.token as string}
							title={article.title}
							description={article.description}
							body={article.body}
							tagList={article.tagList}
							slug={params.slug}
						/>
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
			return (
				<h1 className="text-rose-500 w-fit mx-auto">
					Internal server Error
				</h1>
			);
		}
	}
};

export default EditorPage;
