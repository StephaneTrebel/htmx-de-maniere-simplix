"use client";

import { logout } from "@/actions";
import { Button } from "@/components/ui/button";

const Logout = () => {
	return (
		<Button
			className="w-fit bg-white text-red-900 border border-red-900 hover:text-white hover:bg-red-900"
			onClick={() => logout()}
		>
			Or click here to logout
		</Button>
	);
};

export default Logout;
