import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/actions";


export const metadata: Metadata = {
	title: "Settings",
	description:
		"Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. Setting page of conduit",
};

export default async function SettingsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getSession();

	if (!session.isLoggedIn) redirect("/");

	return <main>{children}</main>;
}
