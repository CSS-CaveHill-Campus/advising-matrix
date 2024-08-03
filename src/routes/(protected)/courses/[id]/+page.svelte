<script lang="ts">
	import type { PageData } from './$types';
	import Card from '$lib/components/Card.svelte';
	import { Background, Controls, SvelteFlow } from '@xyflow/svelte';
	import { writable, type Writable } from 'svelte/store';
	import type { Node, Edge } from '@xyflow/svelte';
	import type { Course } from '$lib/db/schema';

	export let data: PageData;

	import '@xyflow/svelte/dist/style.css';
	import NodeWrapper from '$lib/components/NodeWrapper.svelte';

	type CourseWithPrerequisites = Course & { prerequisites: CourseWithPrerequisites[] };

	const course: CourseWithPrerequisites = data.course;

	function createNodesAndEdges(
		course: CourseWithPrerequisites,
		x = 0,
		y = 0,
		level = 0
	): { nodes: Node[]; edges: Edge[] } {
		const nodes: Node[] = [];
		const edges: Edge[] = [];

		const nodeId = `course-${course.id}-${level}`;
		nodes.push({
			id: nodeId,
			type: 'courseNode',
			data: { code: course.code, name: course.name },
			position: { x, y }
		});

		if (course.prerequisites && course.prerequisites.length > 0) {
			const prereqWidth = 320;
			const totalWidth = (course.prerequisites.length - 1) * prereqWidth;
			const startX = x - totalWidth / 2;

			course.prerequisites.forEach((prereq, index) => {
				const childX = startX + index * prereqWidth;
				const childY = y + 150;

				const { nodes: childNodes, edges: childEdges } = createNodesAndEdges(
					prereq,
					childX,
					childY,
					level + 1
				);

				nodes.push(...childNodes);
				edges.push(...childEdges);

				edges.push({
					id: `${nodeId}-${childNodes[0]!.id}`,
					source: nodeId,
					target: childNodes[0]!.id
				});
			});
		}

		return { nodes, edges };
	}

	const { nodes, edges } = createNodesAndEdges(course);
	const nodesStore: Writable<Node[]> = writable(nodes);
	const edgesStore: Writable<Edge[]> = writable(edges);

	const nodeTypes = {
		courseNode: NodeWrapper
	};
</script>

<Card>
	<div class="px-4 sm:px-0">
		<h3 class="text-2xl font-semibold leading-7 text-gray-900">{course.name}</h3>
		<p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Course Code: {course.code}</p>
	</div>
	<div class="mt-6 border-t border-gray-100">
		<dl class="divide-y divide-gray-100">
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-sm font-medium leading-6 text-gray-900">Level</dt>
				<dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{course.level}</dd>
			</div>
			<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
				<dt class="text-sm font-medium leading-6 text-gray-900">Credits</dt>
				<dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{course.credits}</dd>
			</div>
		</dl>
	</div>
</Card>

{#if course.prerequisites && course.prerequisites.length > 0}
	<div class="mt-8" style="height: 800px;">
		<h3 class="mb-4 text-xl font-semibold">Prerequisites</h3>
		<SvelteFlow nodes={nodesStore} edges={edgesStore} {nodeTypes} fitView>
			<Controls />
			<Background />
		</SvelteFlow>
	</div>
{:else}
	<p class="mt-8 text-gray-500">No prerequisites found.</p>
{/if}
