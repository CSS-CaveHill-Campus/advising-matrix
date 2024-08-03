<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<h1>{$page.data.user.role} Dashboard</h1>
<p>Welcome to Advising Matrix!</p>

<h2>Quick Links</h2>
<div class="my-1 flex gap-6">
	<Button href="/advisor/students">My Students</Button>
	<Button href="/advisor/courses">Program Courses</Button>
</div>
<a href="/advisor/students"> My Students</a>
