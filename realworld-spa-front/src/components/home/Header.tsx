import { titilliumWeb, sourceSansProExtraLight } from "@/lib/font-loader";

export const Header = () => {
	return (
		<div className="bg-green-custom shadow-custom text-white py-5">
			<h1
				className={`${titilliumWeb.className} mx-auto text-5xl pb-0 w-fit h-fit mb-5`}
			>
				Conduit
			</h1>
			<p
				className={`${sourceSansProExtraLight.className} mx-auto w-fit h-fit text-2xl font-thin`}
			>
				A place to share nextjs knowledge
			</p>
		</div>
	);
};
