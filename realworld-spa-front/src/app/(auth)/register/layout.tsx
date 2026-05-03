import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/actions";

export const metadata: Metadata = {
	title: "sign in",
	description:
		"Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. login page of conduit",
};

export default async function LoginLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();

	if (session.isLoggedIn) redirect("/");
	return <main>{children}</main>;
}
