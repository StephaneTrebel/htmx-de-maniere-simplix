import axios from "axios";

import { getSession } from "@/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type TAvatarImageProps = {
	username: string;
	className?: string;
};

export const AvatarImg: React.FC<TAvatarImageProps> = async ({
	username,
	className,
}) => {
	const session = await getSession();

	try {
		const res = await axios.get(
			`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/profiles/${username}`,
			{
				headers: {
					Authorization: session.token
						? `Token ${session.token}`
						: undefined,
				},
			}
		);
		const data = await res.data;

		const { profile } = await data.data;

		return (
			<Avatar className={cn(className)}>
				<AvatarImage src={profile.image} />
				<AvatarFallback>{profile.username}</AvatarFallback>
			</Avatar>
		);
	} catch (err) {
		//console.log(err)
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};
