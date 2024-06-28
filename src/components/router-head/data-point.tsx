export const DataPoint = ({
	title,
	value,
}: { title: string; value: string }) => (
	<div class="flex flex-col gap-2">
		<span class="text-sm text-zinc-500">{title}</span>
		{value}
	</div>
);
