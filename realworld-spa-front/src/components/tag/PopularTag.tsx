import axios from "axios";

import { TagList } from "@/components/tag/TagList";
import { FormattedErrors } from "@/components/error/FormattedErrors";

export const PopularTag = async () => {
	try {
		const res = await axios.get(
			`${process.env.NEXT_PUBLIC_RELATIVE_PATH}/tags`
		);

		const data = await res.data;

		if (data.status === 200) {
			const { tags } = await data.data;
			return (
				<div className="bg-slate-100 shadow-custom rounded p-3 h-fit md:w-72">
					<h1>Popular Tags</h1>
					<TagList
						isClickable
						tagList={tags}
						className="p-0 md:px-0 lg:px-0 mt-2"
						innerClassName="cursor-pointer bg-gray-500 opacity-90 hover:opacity-100 text-white border-none"
					/>
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
		//console.log(err);
		return (
			<h1 className="text-rose-500 w-fit mx-auto">
				Internal server Error
			</h1>
		);
	}
};
