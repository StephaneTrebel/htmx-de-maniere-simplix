import Link from "next/link";

import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export const EditButton: React.FC<{ slug: string; className?: string }> = ({
	slug,
	className,
}) => {
	return (
		<Link
			href={`/editor/${slug}`}
			className={cn(
				"border border-red-50 text-red-50 text-xs opacity-80 flex items-center gap-[3px] rounded h-fit p-1 hover:opacity-45",
				className
			)}
		>
			<Pencil width={13} height={13} />
			<span>Edit Article</span>
		</Link>
	);
};
