<!-- courses.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	export let data: PageData;

	let currentPage = 1;
	const itemsPerPage = 10;

	$: totalPages = Math.ceil(data.courses.length / itemsPerPage);
	$: paginatedCourses = data.courses.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function handlePageChange(newPage: number) {
		currentPage = newPage;
	}
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
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#if paginatedCourses.length === 0}
								<tr>
									<td
										colspan="3"
										class="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500"
									>
										No courses found.
									</td>
								</tr>
							{:else}
								{#each paginatedCourses as course}
									<tr
										class="cursor-pointer hover:bg-gray-50"
										on:click={() => (window.location.href = `/courses/${course.id}`)}
									>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{course.code}</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{course.name}</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{course.level}</td
										>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
</Card>
