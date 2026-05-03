import { Metadata } from "next";

export const metadata: Metadata = {
	title: "single article",
	description:
		"Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. Single page of conduit",
};

export default async function EditorPageLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {

	return <main>{children}</main>;
}
