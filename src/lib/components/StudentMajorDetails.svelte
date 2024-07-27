<script lang="ts">
	export let data;
</script>

<div class="overflow-hidden">
	<div class="flex flex-wrap justify-between gap-x-12 py-2 text-sm">
		<div class="flex flex-col items-start">
			<span class="uppercase text-gray-500">Current Degree</span>
			<div class="font-semibold">
				{data.program?.name || 'Not Found'}
			</div>
		</div>
		<div class="flex flex-col items-start">
			<span class="uppercase text-gray-500">Minor</span>
			<span class="font-semibold">degree.minor</span>
		</div>
		<div class="flex flex-col items-start">
			<span class="uppercase text-gray-500">Classification</span>
			<span class="font-semibold">degree.classification</span>
		</div>
		<div class="flex flex-col items-start">
			<span class="uppercase text-gray-500">Overall GPA</span>
			<span class="font-semibold">$gpa</span>
		</div>
		<div class="flex flex-col items-start">
			<span class="uppercase text-gray-500">Academic Standing</span>
			<!-- {#if parseFloat($gpa) < 2.0} -->
			<span class="font-semibold text-red-500">Academic Warning</span>
			<!-- {:else} -->
			<!-- <span class="font-semibold">Good Standing</span> -->
			<!-- {/if} -->
		</div>
	</div>
</div>
