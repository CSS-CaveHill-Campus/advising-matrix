<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	export let data: PageData;
</script>

<Card>
	<div class="flex flex-col">
		<div class="-m-1.5 overflow-x-auto">
			<div class="inline-block min-w-full p-1.5 align-middle">
				<div class="overflow-hidden rounded-lg border border-gray-200">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Code</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Name</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Level</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Action</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#if data.courses.length === 0}
								<tr>
									<td
										colspan="5"
										class="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500"
									>
										No courses found.
									</td>
								</tr>
							{:else}
								{#each data.courses as major}
									<tr class="hover:bg-gray-50">
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{major.code}</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{major.name}</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{major.level}</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{'Action'}</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</Card>
