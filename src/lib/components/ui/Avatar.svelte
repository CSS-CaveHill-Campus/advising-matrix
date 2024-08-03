<script lang="ts">
	export let name: string;
</script>

<div
	class="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
>
	<span class=" absolute font-semibold uppercase leading-none"
		>{name === null ? 'Anonymous' : name[0]}</span
	>
</div>
