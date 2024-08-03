<script lang="ts">
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';

	$: user = $page.data.user;
	$: if (user.name === null) user.name = 'Anonymous';
</script>

<slot name="sidebar">
	<Sidebar {user} />
</slot>

<slot name="main">
	<main class="ms-16 h-dvh overflow-y-auto bg-gray-50 p-6 md:ms-64">
		<slot />
	</main>
</slot>
