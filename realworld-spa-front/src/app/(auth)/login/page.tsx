import Link from "next/link";

import { LoginForm } from "@/components/auth/login/LoginForm";

const LoginPage = () => {
	return (
		<div className="md:flex md:justify-center">
			<div className="flex flex-col gap-5 m-5 text-center md:w-96">
				<h1 className="text-[2.5rem]">Sign in</h1>
				<Link href="/register" className="text-green-custom hover:underline text-[1rem]">Need an account?</Link>
				<LoginForm />
			</div>
		</div>
	);
};

export default LoginPage;
