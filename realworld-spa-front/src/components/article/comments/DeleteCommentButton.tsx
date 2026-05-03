"use client";

import { Trash2 } from "lucide-react";
import { deleteComment } from "@/actions";

type TDeleteButtonProps = {
	id: number;
	slug: string;
};

export const DeleteCommentButton: React.FC<TDeleteButtonProps> = ({
	id,
	slug,
}) => {
	return (
		<Trash2
			height={15}
			width={15}
			onClick={() => deleteComment(slug, id)}
			className="cursor-pointer text-gray-400"
		/>
	);
};
