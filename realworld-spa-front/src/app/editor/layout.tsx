import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/actions";

export const metadata: Metadata = {
	title: "new article",
	description:
		"Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. Editor page of conduit",
};

export default async function EditorPageLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getSession();

	if (!session.isLoggedIn) redirect("/");
	return <main>{children}</main>;
}
