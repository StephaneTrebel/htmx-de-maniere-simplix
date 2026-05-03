import Link from "next/link";

import { cn } from "@/lib/utils";
import { AvatarImg } from "@/components/profiles/avatar/AvatarImage";

type TUserAvatar = {
	date: string;
	avatarH?: number;
	username: string;
	className?: string;
};

const UserAvatar: React.FC<TUserAvatar> = ({
	date,
	avatarH,
	username,
	className,
}) => {
	date = new Date(date).toDateString().slice(4);
	return (
		<div className="w-fit h-fit bg-transparent flex gap-1 items-center">
			<Link href={`/profile/${username}`}>
				<AvatarImg
					username={username}
					className={cn(avatarH && `h-${avatarH} w-${avatarH}`)}
				/>
			</Link>
			<div
				className={cn(
					"w-fit h-fit flex flex-col justify-start",
					className
				)}
			>
				<Link href={`/profile/${username}`}>{username}</Link>
				<p className="opacity-65 font-light">{date}</p>
			</div>
		</div>
	);
};

export default UserAvatar;
