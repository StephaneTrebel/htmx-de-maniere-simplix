"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TNavLink } from "@/components/navbar/interfaces/navlink";

const NavLink: React.FC<TNavLink> = ({ href, name, isLoggedIn, icon }) => {
	const pathname = usePathname();
	let substring = href.split("/")[1];
	let exist: boolean = false;
	exist =
		substring === ""
			? pathname === href
			: pathname.startsWith(`/${substring}`);

	if (isLoggedIn) {
		return (
			<div
				className={cn(
					"text-slate-300 cursor-pointer hover:text-slate-900 last:pr-0 ",
					pathname == href && "text-slate-900",
					icon ? "flex" : ""
				)}
			>
				{icon}
				<Button
					className={cn(
						"text-slate-300 hover:no-underline hover:text-slate-900",
						exist && "text-slate-900",
						icon ? "p-1" : ""
					)}
					asChild
					variant="link"
				>
					<Link href={href}>{name}</Link>
				</Button>
			</div>
		);
	}
};

export default NavLink;
