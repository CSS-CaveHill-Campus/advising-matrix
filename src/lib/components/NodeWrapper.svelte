<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';

	type $$Props = NodeProps;

	export let data: $$Props['data'];

	const { code, name } = data;

	$$restProps;
</script>

<div
	class="flex h-full w-[200px] flex-col rounded-2xl border border-solid border-gray-200 bg-white/70 shadow-sm"
>
	<Handle type="target" position={Position.Top} />
	<div
		class="truncate rounded-t-2xl border-b border-solid border-gray-200 px-3 py-2 text-center text-sm font-semibold text-[#0F172A]"
	>
		{code}
	</div>
	<div
		class="relative flex h-full items-center justify-center rounded-b-2xl bg-white p-3 text-center text-xs font-light text-gray-700"
	>
		{name}
	</div>
	<Handle type="source" position={Position.Bottom} />
</div>
