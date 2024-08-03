<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<h1>{$page.data.user.role} Dashboard</h1>
<p>Welcome to Advising Matrix!</p>

<h2>Quick Links</h2>
<div class="my-1 flex gap-6">
	<Button href="/users">All Users</Button>
	<Button href="/admin/courses">Program Courses</Button>
</div>
