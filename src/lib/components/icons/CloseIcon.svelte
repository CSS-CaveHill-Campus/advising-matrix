<script lang="ts">
	import { cn } from '$lib/utils';

	let className: string | undefined = undefined;

	export { className as class };
</script>

<svg
	class={cn('size-4 flex-shrink-0', className)}
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
>
