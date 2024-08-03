<script lang="ts">
	export let currentPage: number;
	export let totalPages: number;
	export let onPageChange: (page: number) => void;

	function changePage(page: number) {
		if (page >= 1 && page <= totalPages) {
			onPageChange(page);
		}
	}

	$: visiblePages = getVisiblePages(currentPage, totalPages);

	function getVisiblePages(current: number, total: number) {
		if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
		if (current <= 2) return [1, 2, 3];
		if (current >= total - 1) return [total - 2, total - 1, total];
		return [current - 1, current, current + 1];
	}
</script>

<div class="mt-5 flex items-center justify-between">
	<div class="hidden sm:block">
		<p class="text-sm text-gray-700 dark:text-gray-400">
			Showing page <span class="font-medium">{currentPage}</span> of
			<span class="font-medium">{totalPages}</span>
		</p>
	</div>

	<nav class="flex items-center justify-end gap-x-1" aria-label="Pagination">
		<button
			type="button"
			class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
			on:click={() => changePage(currentPage - 1)}
			disabled={currentPage === 1}
			aria-label="Previous"
		>
			<svg
				class="size-3.5 shrink-0"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m15 18-6-6 6-6"></path>
			</svg>
			<span class="sr-only">Previous</span>
		</button>

		<div class="flex items-center gap-x-1">
			{#each visiblePages as page}
				<button
					type="button"
					class="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg px-3 py-2 text-sm focus:outline-none disabled:pointer-events-none disabled:opacity-50
                  {currentPage === page
						? 'bg-gray-200 text-gray-800 focus:bg-gray-300 dark:bg-neutral-600 dark:text-white dark:focus:bg-neutral-500'
						: 'text-gray-800 hover:bg-gray-100 focus:bg-gray-100 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10'}"
					on:click={() => changePage(page)}
					aria-current={currentPage === page ? 'page' : undefined}
				>
					{page}
				</button>
			{/each}
		</div>

		<button
			type="button"
			class="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-x-2 rounded-lg px-2.5 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
			on:click={() => changePage(currentPage + 1)}
			disabled={currentPage === totalPages}
			aria-label="Next"
		>
			<span class="sr-only">Next</span>
			<svg
				class="size-3.5 shrink-0"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m9 18 6-6-6-6"></path>
			</svg>
		</button>
	</nav>
</div>
