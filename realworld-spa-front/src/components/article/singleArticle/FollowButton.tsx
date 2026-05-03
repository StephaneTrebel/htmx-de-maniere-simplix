"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { follow, unFollow } from "@/actions";

type TFollowButtonProps = {
	following: boolean;
	username: string;
};
const FollowButton: React.FC<TFollowButtonProps> = ({
	following,
	username,
}) => {
	return (
    
		<Button
			variant="link"
			onClick={
				following
					? async () => await unFollow(username)
					: async () => await follow(username)
			}
			className="m-0 px-2 py-1 h-fit text-xs md:text-sm flex gap-1 bg-slate-300 opacity-75 border border-black-custom underline-offset-0 hover:no-underline  hover:opacity-100"
		>
			<Plus height={15} width={15} />
			<span>
				{following ? "Unfollow " : "Follow "}
				{username}
			</span>
		</Button>
	);
};

export default FollowButton;
