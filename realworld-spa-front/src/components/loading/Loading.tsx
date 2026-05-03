"use client";

import { ColorRing } from "react-loader-spinner";

type TLoadingProps = {
	height?: number;
	width?: number;
};

export const Loading: React.FC<TLoadingProps> = ({ height, width }) => {
	let h: string = height ? `${height}` : "80";
	let w: string = width ? `${width}` : "80";

	return (
		<ColorRing
			height={h}
			width={w}
			wrapperStyle={{ margin: "auto" }}
			colors={["#5cb85c", "#5cb85c", "#5cb85c", "#5cb85c", "#5cb85c"]}
		/>
	);
};
