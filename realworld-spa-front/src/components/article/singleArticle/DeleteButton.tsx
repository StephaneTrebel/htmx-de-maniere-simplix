"use client";

import { Trash2 } from "lucide-react";

import { deleteArticle } from "@/actions";
import { Button } from "@/components/ui/button";

export const DeleteButton: React.FC<{ slug: string }> = ({ slug }) => {
	return (
		<Button
			variant="link"
			onClick={() => deleteArticle(slug)}
			className="border border-rose-400 text-rose-400 text-xs opacity-80 flex items-center gap-[3px] rounded h-fit p-1 hover:opacity-45 hover:no-underline"
		>
			<Trash2 width={13} height={13} />
			<span>Delete Article</span>
		</Button>
	);
};
