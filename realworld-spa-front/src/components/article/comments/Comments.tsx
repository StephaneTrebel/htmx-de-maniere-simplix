import axios from "axios";

import UserAvatar from "@/components/profiles/avatar/UserAvatar";
import { DeleteCommentButton } from "@/components/article/comments/DeleteCommentButton";

type TCommentsProps = {
	slug: string;
	token: string;
};

export const Comments: React.FC<TCommentsProps> = async ({ slug, token }) => {
	try {
		const res = await axios.get(
			`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/articles/${slug}/comments`,
			{
				headers: {
					Authorization: `Token ${token}`,
				},
			}
		);
		const data = await res.data;

		const { comments } = await data.data;
		return (
			<>
				{comments.map((comment: any) => (
					<div
						key={comment.id}
						className="my-5 mx-2 md:w-3/6 md:mx-auto border rounded-md"
					>
						<p className="p-5 border-b">{comment.body}</p>
						<div className="flex justify-between items-center p-3 text-sm bg-gray-100">
							<UserAvatar
								username={comment.author.username}
								date={comment.createdAt}
								className="flex-row gap-2 text-slate-400"
								avatarH={7}
							/>
							<DeleteCommentButton slug={slug} id={comment.id} />
						</div>
					</div>
				))}
			</>
		);
	} catch (err) {
		//console.log(err);
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};
