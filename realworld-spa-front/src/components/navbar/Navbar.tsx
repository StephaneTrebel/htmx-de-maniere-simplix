import Link from "next/link";

import axios from "axios";
import { Settings, FilePenLine } from "lucide-react";

import { getSession } from "@/actions";

import { titilliumWeb } from "@/lib/font-loader";
import NavLink from "@/components/navbar/NavLink";
import { TNavLink } from "@/components/navbar/interfaces/navlink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavBar = async () => {
	const session = await getSession();
	const navLinks: TNavLink[] = [
		{
			href: "/",
			name: "Home",
			isLoggedIn: true,
		},
		{
			href: "/login",
			name: "Sign in",
			isLoggedIn: !session.isLoggedIn,
		},
		{
			href: "/register",
			name: "Sign up",
			isLoggedIn: !session.isLoggedIn,
		},
		{
			href: "/editor/new",
			name: "New Article",
			icon: <FilePenLine className="m-auto" width={16} height={16} />,
			isLoggedIn: session.isLoggedIn,
		},
		{
			href: "/settings",
			name: "Settings",
			icon: <Settings className="m-auto" width={16} height={16} />,
			isLoggedIn: session.isLoggedIn,
		},
	];

	try {
		if (session.isLoggedIn) {
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/user`,
				{
					headers: {
						Authorization: `Token ${session.token}`,
					},
				}
			);
			const data = await res.data;

			const { user } = await data.data;
			navLinks.push({
				href: `/profile/${user.username}`,
				name: session.username as string,
				icon: (
					<Avatar className=" hidden md:block">
						<AvatarImage
							//TODO: actual image
							src={user.image}
							alt="profile"
						/>
						<AvatarFallback>{session!.username!}</AvatarFallback>
					</Avatar>
				),
				isLoggedIn: session.isLoggedIn,
			});
		}
		return (
			<div className="flex flex-col md:flex-row justify-between  min-w-full py-2 px-4 md:px-10 lg:px-14">
				<Link
					className={`${titilliumWeb.className} text-green-custom text-2xl font-bold`}
					href="/"
				>
					conduit
				</Link>
				<div className="flex justify-end items-center gap-2">
					{navLinks.map((link) => (
						<NavLink
							isLoggedIn={link.isLoggedIn}
							key={link.name}
							href={link.href}
							name={link.name}
							icon={link.icon}
						/>
					))}
				</div>
			</div>
		);
	} catch (err) {
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};

export default NavBar;
