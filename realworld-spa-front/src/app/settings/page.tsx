import axios from "axios";

import { getSession } from "@/actions";
import Logout from "@/components/settings/Logout";
import { Separator } from "@/components/ui/separator";
import { SettingForm } from "@/components/settings/SettingForm";
import { FormattedErrors } from "@/components/error/FormattedErrors";

const SettingsPage = async () => {
	const session = await getSession();

	try {
		const res = await axios.get(`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/user`, {
			headers: {
				Authorization: `Token ${session.token}`,
			},
		});
		const data = await res.data;

		if (data.status === 200) {
			const { user } = await data.data;
			return (
				<div className="max-w-96 mx-5 md:mx-auto flex flex-col gap-3">
					<h1 className="text-5xl mx-auto w-fit h-fit">
						Your Settings
					</h1>
					<SettingForm
						bio={user.bio}
						email={user.email}
						imageUrl={user.image}
						username={user.username}
						token={session.token as string}
					/>
					<Separator />
					<Logout />
				</div>
			);
		} else {
			return (
				<h1 className="text-rose-500 w-fit mx-auto">
					<FormattedErrors
						data={data.data}
						className="ml-5 capitalize"
					/>
				</h1>
			);
		}
	} catch (err) {
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};

export default SettingsPage;
