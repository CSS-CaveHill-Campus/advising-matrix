<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import CloseIcon from '../icons/CloseIcon.svelte';
	import { cn } from '$lib/utils';
	import { browser } from '$app/environment';

	export let open = false;
	export let title: string;

	const dispatch = createEventDispatcher();

	function closeModal() {
		open = false;
		dispatch('close');
	}

	$: if (browser) {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && open) closeModal();
	};

	onMount(() => {
		return () => {
			if (browser) {
				document.body.style.overflow = '';
			}
		};
	});

	let className: string = '';
	export { className as class };
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-md"
		on:click|self={closeModal}
		transition:fade={{ duration: 200 }}
	>
		<div
			class={cn('w-full max-w-md rounded-lg bg-white shadow-lg', className)}
			transition:fly={{ y: 20, duration: 200 }}
			role="dialog"
			aria-labelledby="modal-title"
		>
			<div class="flex items-center justify-between p-3">
				<h3 id="modal-title" class="text-lg font-semibold text-gray-800">
					{title}
				</h3>
				<button
					class="rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-red-600"
					on:click={closeModal}
					aria-label="Close modal"
				>
					<div transition:scale={{ duration: 200 }}>
						<CloseIcon />
					</div>
				</button>
			</div>
			<div class="px-3 pb-3">
				<slot />
			</div>
			{#if $$slots.footer}
				<div class="flex justify-end space-x-2 border-t border-gray-200 p-3">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}
