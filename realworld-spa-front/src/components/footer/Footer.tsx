import Link from "next/link";

import { format } from "date-fns";
import { Github } from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-gray-100 rounded-lg shadow  py-2 pl-5 text-start mt-auto">
			<Link
				href="/"
				className={` text-green-custom text-lg font-bold hover:underline mr-3`}
			>
				conduit
			</Link>
			<span className="text-sm text-gray-300 sm:text-center">
				© {format(Date.now(), "yyyy")} .An interactive learning project
				from{" "}
				<Link
					href="https://thinkster.io/"
					className="hover:underline text-green-300"
				>
					Thinkster
				</Link>
				. Code licensed under MIT. Developed by{" "}
				<span className={` text-green-custom font-bold mr-3`}>
					Salahadin Dinsafa{" "}
					<Link href="https://github.com/salahadin-dinsafa/realworld-front" >
						<Github
							height={15}
							width={15}
							className="inline ml-2 mb-1 text-black-custom fill-black-custom "
						/>
					</Link>
				</span>
			</span>
		</footer>
	);
};

export default Footer;
