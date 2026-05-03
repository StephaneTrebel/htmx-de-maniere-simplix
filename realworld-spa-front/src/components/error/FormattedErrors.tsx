import { cn } from "@/lib/utils";

export type TFormattedErrors = {
	data: {
		[key: string]: string[];
	};
	className?: string;
};

export const FormattedErrors: React.FC<TFormattedErrors> = ({
	data,
	className,
}) => {
	const keys = Object.keys(data);
	return (
		<ul className={cn("list-disc text-left text-rose-700", className)}>
			{keys.map((ele) =>
				data[ele].map((error, index) => (
					<li key={index}>{ele + " " + error}</li>
				))
			)}
		</ul>
	);
};
