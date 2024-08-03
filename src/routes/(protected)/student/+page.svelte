<script lang="ts">
	import { page } from '$app/stores';
	import DonutChart from '$lib/components/DonutChart.svelte';
	import PieChart from '$lib/components/PieChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section id="welcome">
	<h1>{$page.data.user.role} Dashboard - {data.user?.name}</h1>
</section>
<section id="charts" class="py-3 md:grid md:grid-cols-12">
	<PieChart />
	<div id="completed-courses" class="col-span-6 col-start-8 gap-6 md:grid md:grid-cols-2">
		<DonutChart title="mandatory" />
		<DonutChart title="elective" />
		<DonutChart title="foundation" />
	</div>
</section>
