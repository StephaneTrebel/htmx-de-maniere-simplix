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
import { Textarea } from "@/components/ui/textarea";
import { TState } from "@/components/auth/interfaces/state";
import { TError } from "@/app/api/(auth)/login/interfaces/error";
import { FormattedErrors } from "@/components/error/FormattedErrors";

const formSchema = z.object({
	imageUrl: z.string().min(5).optional(),
	username: z.string().min(2).optional(),
	password: z.string().optional(),
	email: z.string().email().optional(),
	bio: z.string().optional(),
});

export type TSettingFormProps = {
	imageUrl: string;
	username: string;
	bio: string;
	email: string;
	token: string;
};

export const SettingForm: React.FC<TSettingFormProps> = ({
	bio,
	email,
	token,
	imageUrl,
	username,
}) => {
	const [state, setState] = useState<TState>({
		loading: false,
		isError: false,
		errors: {},
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			imageUrl,
			username,
			email,
			bio,
			password: undefined,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setState((prevState) => ({ ...prevState, loading: true }));
		await axios
			.put(
				`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/user`,
				{
					...values,
				},
				{
					headers: {
						Authorization: `Token ${token}`,
					},
				}
			)
			.then(async (res) => {
				if (res.data.status === 200) {
					setState((prevState) => ({ ...prevState, loading: false }));
					const data = await res.data;
					window.location.assign(
						`/profile/${data.data.user.username}`
					);
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
		<Form {...form}>
			{state.isError && (
				<FormattedErrors data={state.errors} className="ml-5" />
			)}
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="imageUrl"
					disabled={state.loading}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									placeholder="image url"
									{...field}
									className="py-3 px-6 text-xl rounded-s-md text-gray-500 placeholder:text-gray-500  focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="username"
					disabled={state.loading}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									placeholder="username"
									{...field}
									className="py-3 px-6 text-xl rounded-s-md text-gray-500 placeholder:text-gray-500  focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="bio"
					disabled={state.loading}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									placeholder="bio"
									{...field}
									className="py-3 px-6 text-xl rounded-s-md text-gray-500 placeholder:text-gray-500  focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					disabled={state.loading}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									placeholder="email address"
									{...field}
									className="py-3 px-6 text-xl rounded-s-md text-gray-500 placeholder:text-gray-500  focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
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
									placeholder="New Password"
									{...field}
									className="py-3 px-6 text-xl rounded-s-md text-gray-500 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-custom"
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
						className="bg-green-custom opacity-95 py-3 px-5 rounded-md  text-xl hover:bg-green-custom hover:opacity-100"
					>
						Update Settings
					</Button>
				</div>
			</form>
		</Form>
	);
};
