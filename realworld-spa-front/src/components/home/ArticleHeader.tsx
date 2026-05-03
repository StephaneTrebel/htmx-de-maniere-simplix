"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type TArticleHeader = {
	choices: {
		name: string;
		query: string;
	}[];
};

export const ArticleHeader: React.FC<TArticleHeader> = ({ choices }) => {
	const path = usePathname();
	const searchParams = useSearchParams();
	const search = searchParams.entries().next();

	let query: string = path.startsWith("/profile")
		? search.value &&
		  search.value[0] != "page" &&
		  search.value[0] != "offset"
			? search.value.join("=")
			: `author=${path.split("/")[2]}`
		: search.value &&
		  search.value[0] != "page" &&
		  search.value[0] != "offset"
		? search.value.join("=")
		: "";


	return (
		<div>
			<div className="flex gap-3">
				{choices.map((choice, i) => (
					<Link
						className={cn(
							"opacity-85 pb-2 hover:opacity-100 border-b border-b-white",
							query === choice.query &&
								" border-b-green-custom text-green-custom"
						)}
						key={i}
						href={`${path}/?${choice.query}`}
					>
						{choice.name}
					</Link>
				))}
				{search.value && search.value[0] === "tag" && (
					<h1 className="opacity-85 pb-2 hover:opacity-100 border-b px-3 text-lg border-b-green-custom text-green-custom">
						#{search.value[1]}
					</h1>
				)}
			</div>
			<Separator />
		</div>
	);
};
