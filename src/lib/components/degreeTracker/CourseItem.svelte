<script lang="ts">
	import { gradePoints } from '$lib/types';
	import type { CourseWithPrerequisites, Grade } from '$lib/types';
	import { derived } from 'svelte/store';

	export let course: CourseWithPrerequisites;
	export let completedCoursesStore: any;
	export let courseGradesStore: any;

	const arePrerequisitesMetStore = derived(completedCoursesStore, ($completedCoursesStore) => {
		if (!course.prerequisites || course.prerequisites.length === 0) return true;
		return course.prerequisites.every((prereq) => $completedCoursesStore[prereq.id]);
	});

	function handleGradeChange(courseId: string, event: Event) {
		const target = event.target as HTMLSelectElement;
		courseGradesStore.update((grades: Record<string, '' | Grade>) => ({
			...grades,
			[courseId]: target.value as Grade
		}));
		completedCoursesStore.update((completed: Record<string, boolean>) => ({
			...completed,
			[courseId]: !!target.value
		}));
	}
</script>

<li>
	<div class="flex items-center px-4 py-4 sm:px-6">
		<div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
			<div>
				<div class="flex items-center">
					<input
						type="checkbox"
						id={`course-${course.id}`}
						name={`courses[${course.id}].completed`}
						bind:checked={$completedCoursesStore[course.id]}
						class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						disabled
					/>
					<label for={`course-${course.id}`} class="ml-3 block">
						<span class="font-medium text-gray-900">{course.code}</span>
						<span class="ml-1 text-gray-500">{course.name}</span>
					</label>
				</div>
				<div class="mt-1 flex items-center text-sm text-gray-500">
					<span>Level: {course.level}</span>
					<span
						class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
					>
						{course.credits} Credits
					</span>
				</div>
				{#if course.prerequisites && course.prerequisites.length > 0}
					{@const unmetPrerequisites = course.prerequisites.filter(
						(prereq) => !$completedCoursesStore[prereq.id]
					)}
					{#if unmetPrerequisites.length > 0}
						<div class="mt-1 text-sm">
							<span class="font-bold text-red-500">Prerequisites: </span>
							<span class="text-gray-700">
								{#each unmetPrerequisites as prereq}
									<span class="mr-2">{prereq.code}</span>
								{/each}
							</span>
						</div>
					{/if}
				{/if}
			</div>
			<div class="mt-4 flex-shrink-0 sm:ml-5 sm:mt-0">
				<select
					name={`courses[${course.id}].grade`}
					value={$courseGradesStore[course.id] ?? ''}
					on:change={(e) => handleGradeChange(course.id, e)}
					class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
					disabled={!$arePrerequisitesMetStore}
				>
					<option value="">Select Grade</option>
					{#each Object.keys(gradePoints) as grade}
						<option value={grade}>{grade}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</li>
