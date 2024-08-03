<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';

	$: user = $page.data.user;
	$: if (user.name === null) user.name = 'Anonymous';
</script>

<Sidebar {user} />
<main class="h-screen bg-gray-50 ps-16 md:ps-64">
	<div class="p-2 sm:p-5 sm:py-0 md:pt-5">
		<slot />
	</div>
</main>
