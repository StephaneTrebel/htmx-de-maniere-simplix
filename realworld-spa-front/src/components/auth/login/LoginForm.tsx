"use client";

import { useState } from "react";

import { z } from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
	Form,
	FormItem,
	FormField,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { TState } from "@/components/auth/interfaces/state";
import { TError } from "@/app/api/(auth)/login/interfaces/error";
import { FormattedErrors } from "@/components/error/FormattedErrors";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const LoginForm = () => {
	const [state, setState] = useState<TState>({
		loading: false,
		isError: false,
		errors: {},
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setState((prevState) => ({ ...prevState, loading: true }));
		await axios
			.post("/api/login", values)
			.then((res) => {
				if (res.data.status === 200) {
					setState((prevState) => ({ ...prevState, loading: false }));
					window.location.assign("/");
				} else {
					setState((_prevState) => ({
						loading: false,
						isError: true,
						errors: res.data.data,
					}));
				}
			})
			.catch((err) => {
				console.log("From LoginForm", err);
				const errors: TError = {
					"": [err.response.statusText],
				};

				setState((prevState) => ({
					...prevState,
					loading: false,
					isError: true,
					errors,
				}));
			});
	}
	

	return (
		<>
			{state.isError && (
				<FormattedErrors data={state.errors} className="ml-5" />
			)}

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
				>
					<FormField
						control={form.control}
						name="email"
						disabled={state.loading}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										placeholder="Email"
										{...field}
										className="py-3 px-6 text-xl rounded-s-md text-gray-400 placeholder:text-gray-400  focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						disabled={state.loading}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										type="password"
										placeholder="Password"
										{...field}
										className="py-3 px-6 text-xl rounded-s-md text-gray-400 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={state.loading}
							className="bg-green-custom opacity-65 py-3 px-5 rounded-md  text-xl hover:bg-green-custom hover:opacity-100"
						>
							Sign in
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
