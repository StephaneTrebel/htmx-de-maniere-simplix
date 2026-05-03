import { Metadata } from "next";

export const metadata: Metadata = {
	title: "profile",
	description:
		"Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. Profile page of conduit",
};

export default async function ProfileLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {

	return <main>{children}</main>;
}
