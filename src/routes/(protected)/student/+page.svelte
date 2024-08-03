<script lang="ts">
	import { page } from '$app/stores';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';

	let advisorName = 'Mr.TempName';
	let gpa = 3.99;
</script>

<div class="container px-6 py-4">
	<section id="welcome">
		<h1>{$page.data.user.role} Dashboard</h1>
	</section>
	<section id="charts" class="">
		<PieChart />
		<div id="completed-courses" class="border sm:grid sm:grid-cols-3">
			<DonutChart title="mandatory" />
			<DonutChart title="elective" />
			<DonutChart title="foundation" />
		</div>
	</section>
</div>
