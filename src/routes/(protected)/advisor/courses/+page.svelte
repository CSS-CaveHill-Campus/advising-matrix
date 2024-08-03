<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h2>All Courses</h2>
{#if data.courses.length === 0}
	<p>No courses available.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Code</th>
				<th>Name</th>
				<th>Level</th>
				<th>Credits</th>
			</tr>
		</thead>
		<tbody>
			{#each data.courses as course}
				<tr>
					<td>{course.code}</td>
					<td>{course.name}</td>
					<td>{course.level}</td>
					<td>{course.credits}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
</style>
