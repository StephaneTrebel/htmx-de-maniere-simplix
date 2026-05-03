import Link from "next/link";

import { SignUpForm } from "@/components/auth/register/SignUpForm";

const LoginPage = () => {
	return (
		<div className="md:flex md:justify-center">
			<div className="flex flex-col gap-5 m-5 text-center md:w-96">
				<h1 className="text-[2.5rem]">Sign up</h1>
				<Link
					href="/register"
					className="text-green-custom hover:underline text-[1rem]"
				>
					Have an account?
				</Link>
				<SignUpForm />
			</div>
		</div>
	);
};

export default LoginPage;
