<script lang="ts">
	import { gradePoints } from '$lib/types';
	import type { CourseWithRequirement, Grade, ProgramRequirement } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import TrashIcon from '../icons/TrashIcon.svelte';
	import { enhance } from '$app/forms';
	import { poolCourses } from '$lib/stores/degreeTracker';

	export let requirement: ProgramRequirement;
	let courses: CourseWithRequirement[];
	export let completedCoursesStore: any;
	export let courseGradesStore: any;
	export let onAddCourse: (requirementId: string) => void;

	$: currentCredits = $poolCourses.reduce((sum, course) => sum + course.credits, 0);

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

	function arePrerequisitesMet(course: CourseWithRequirement): boolean {
		if (!course.prerequisites || course.prerequisites.length === 0) return true;
		return course.prerequisites.every((prereq) => $completedCoursesStore[prereq.id]);
	}
</script>

<li>
	<div class="flex flex-col px-4 py-4 sm:px-6">
		<div class="flex items-center justify-between">
			<span class="font-medium text-gray-900">
				{requirement.type} Requirement ({currentCredits}/{requirement.credits} credits)
			</span>
			{#if currentCredits < requirement.credits}
				<Button on:click={() => onAddCourse(requirement.id)}>Add Course</Button>
			{/if}
		</div>
		{#each $poolCourses as course (course.id)}
			<div class="mt-2 flex items-center">
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
					<div class="mt-4 flex flex-shrink-0 items-center sm:ml-5 sm:mt-0">
						<input
							type="hidden"
							name={`courses[${course.id}].requirementId`}
							value={requirement.id}
						/>
						<select
							name={`courses[${course.id}].grade`}
							value={$courseGradesStore[course.id] ?? ''}
							on:change={(e) => handleGradeChange(course.id, e)}
							class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
							disabled={!arePrerequisitesMet(course)}
						>
							<option value="">Select Grade</option>
							{#each Object.keys(gradePoints) as grade}
								<option value={grade}>{grade}</option>
							{/each}
						</select>
						<form
							method="POST"
							action="?/removeCourse"
							use:enhance={() => {
								return async ({ update }) => {
									poolCourses.update((poolCourses) => {
										return poolCourses.filter((poolCourse) => poolCourse.id !== course.id);
									});
									await update();
								};
							}}
						>
							<input type="hidden" name="courseId" value={course.id} />
							<input type="hidden" name="requirementId" value={requirement.id} />
							<button type="submit" class="ml-2 text-red-500 hover:text-red-700">
								<TrashIcon />
							</button>
						</form>
					</div>
				</div>
			</div>
		{/each}
	</div>
</li>
