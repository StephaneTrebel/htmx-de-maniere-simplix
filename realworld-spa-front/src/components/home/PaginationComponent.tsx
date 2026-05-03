"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
	Pagination,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationContent,
	PaginationEllipsis,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { setQuery } from "@/components/tag/Tag";

type TPaginationComponents = {
	page: number;
	offset: number;
	articlesCount: number;
};
export const PaginationComponent: React.FC<TPaginationComponents> = ({
	page,
	offset,
	articlesCount,
}) => {
	const [limit, setLimit] = useState(page);
	const path = usePathname();
	const router = useRouter();
	const param = useSearchParams();
	const params = new URLSearchParams(param.toString());

	let paginationLimit: number = Math.ceil(articlesCount / 10);

	useEffect(() => {
		if (limit > paginationLimit) {
			setLimit(paginationLimit);
			const result = setQuery(params, [
				{ key: "page", value: limit },
				{ key: "offset", value: (limit - 1) * 10 },
			]);

			router.push(`${path}?${result}`);
		} else if (limit < 1) {
			const result = setQuery(params, [
				{ key: "page", value: 1 },
				{ key: "offset", value: 0 },
			]);
			router.push(`${path}?${result}`);
		} else if (offset / 10 + 1 !== limit) {
			const result = setQuery(params, [
				{ key: "page", value: limit },
				{ key: "offset", value: (limit - 1) * 10 },
			]);
			router.push(`${path}?${result}`);
		}
	}, []);

	let paginationElements: number[] = [];
	let paginationEnd: number =
		page > 10 ? page : paginationLimit < 10 ? paginationLimit : 10;
	let paginationStart: number = page > 10 ? page - 9 : 1;

	for (let i = paginationStart; i <= paginationEnd; i++) {
		paginationElements.push(i);
	}

	const onPaginationClick = (page: number) => {
		const result = setQuery(params, [
			{ key: "page", value: page },
			{ key: "offset", value: (page - 1) * 10 },
		]);
		router.push(`${path}?${result}`);
	};
	const onNextClick = () => {
		let nextPage = +page + 1;
		const result = setQuery(params, [{ key: "page", value: nextPage }]);

		if (nextPage <= paginationLimit) router.push(`${path}?${result}`);
	};
	const onPrevClick = () => {
		let prevPage = +page - 1;
		const result = setQuery(params, [{ key: "page", value: prevPage }]);
		if (prevPage >= 1) router.push(`${path}?${result}`);
	};

	return (
		<Pagination>
			<PaginationContent className="flex-wrap gap-0">
				<PaginationItem>
					<PaginationPrevious
						onClick={onPrevClick}
						className={cn(
							"cursor-pointer bg-transparent border p-1 hover:bg-gray-300 focus:bg-green-custom focus:text-white rounded-none rounded-l",
							page == 1 && "hidden"
						)}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationEllipsis
						className={cn(
							"bg-transparent  p-1 h-10  border",

							paginationStart === 1 && "hidden"
						)}
					/>
				</PaginationItem>
				{paginationElements.map((element) => (
					<PaginationItem key={element}>
						<PaginationLink
							onClick={() => onPaginationClick(element)}
							className={cn(
								"bg-transparent border p-1 rounded-none cursor-pointer hover:bg-gray-300 ",
								page == element && "bg-green-custom text-white"
							)}
						>
							{element}
						</PaginationLink>
					</PaginationItem>
				))}
				<PaginationItem>
					<PaginationEllipsis
						className={cn(
							"bg-transparent  p-1 h-10  border",

							paginationEnd == paginationLimit && "hidden"
						)}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext
						onClick={onNextClick}
						className={cn(
							"cursor-pointer bg-transparent border p-1 hover:bg-gray-300 focus:bg-green-custom focus:text-white rounded-none rounded-r",
							page == paginationLimit && "hidden"
						)}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};
