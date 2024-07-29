<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import {
		gradePoints,
		type CourseWithPrerequisites,
		type CourseWithRequirement,
		type Grade
	} from '$lib/types';
	import { derived, writable } from 'svelte/store';
	import type { PageData } from './$types';
	import type { Course } from '$lib/db/schema';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Select from '$lib/components/ui/dropdown/Select.svelte';
	import Option from '$lib/components/ui/dropdown/Option.svelte';
	import CourseItem from '$lib/components/degreeTracker/CourseItem.svelte';
	import PoolRequirementItem from '$lib/components/degreeTracker/PoolRequirementPool.svelte';
	import { poolCourses } from '$lib/stores/degreeTracker';
	import { onMount } from 'svelte';

	export let data: PageData;

	// Destructure data
	let { program, programCourses, electiveCourses, studentCourses, requirements } = data;

	// Local state
	let dialogOpen = false;
	let currentRequirement: string | null = null;

	let degree = {
		name: ['BSc Computer Science', 'BSc Mathematics'],
		minor: 'N/A',
		classification: 'Level III/Third Year'
	};

	// Stores
	const courseGradesStore = writable<Record<string, Grade | ''>>({});
	const completedCoursesStore = writable<Record<string, boolean>>({});
	const programCoursesStore = writable<CourseWithRequirement[]>([]);

	// Pool courses
	onMount(() => {
		requirements.forEach((req) => {
			if (req.type === 'POOL' && req.credits > 0)
				poolCourses.set($programCoursesStore.filter((course) => course.requirementId === req.id));
		});
	});

	// Helper functions
	function arePrerequisitesMet(course: CourseWithPrerequisites | CourseWithRequirement): boolean {
		if (!course.prerequisites || course.prerequisites.length === 0) return true;
		return course.prerequisites.every((prereq) => $completedCoursesStore[prereq.id]);
	}

	function addCourse(course: Course, requirementId: string) {
		programCoursesStore.update((courses) => [
			...courses,
			{ ...course, requirementId, prerequisites: [] } as CourseWithRequirement
		]);
		poolCourses.update((courses) => [
			...courses,
			{ ...course, requirementId, prerequisites: [] } as CourseWithRequirement
		]);
		courseGradesStore.update((grades) => ({ ...grades, [course.id]: '' }));
		completedCoursesStore.update((completed) => ({ ...completed, [course.id]: false }));
		dialogOpen = false;
	}

	function handleAddCourse() {
		const courseElement = document.getElementById('course') as HTMLSelectElement | null;
		const selectedCourseId = courseElement?.value;
		if (selectedCourseId && currentRequirement) {
			const selectedCourse = electiveCourses.find((c) => c.id === selectedCourseId);
			if (selectedCourse) addCourse(selectedCourse, currentRequirement);
		}
	}

	function openAddCourseModal(requirementId: string) {
		currentRequirement = requirementId;
		dialogOpen = true;
	}

	// Reactive statements
	$: if (programCourses) {
		programCoursesStore.set(programCourses.map((course) => ({ ...course, requirementId: null })));
	}

	$: if (programCourses && studentCourses) {
		const allCourses: CourseWithRequirement[] = programCourses.map((course) => ({
			...course,
			requirementId: null
		}));

		Object.entries(studentCourses).forEach(([courseId, courseData]) => {
			if (courseData.requirementId && !allCourses.some((c) => c.id === courseId)) {
				const course = electiveCourses.find((c) => c.id === courseId);
				if (course) {
					allCourses.push({
						...course,
						requirementId: courseData.requirementId,
						prerequisites: []
					});
				}
			}
		});

		programCoursesStore.set(allCourses);

		const grades: Record<string, Grade | ''> = {};
		const completed: Record<string, boolean> = {};

		allCourses.forEach((course) => {
			const studentCourse = studentCourses[course.id];
			const grade = studentCourse?.grade;
			grades[course.id] = (grade && grade in gradePoints ? grade : '') as Grade | '';
			completed[course.id] = !!grade && arePrerequisitesMet(course);
		});

		courseGradesStore.set(grades);
		completedCoursesStore.set(completed);
	}

	// Derived values
	const totalCredits = derived(
		programCoursesStore,
		($programCourses) => $programCourses.reduce((sum, course) => sum + course.credits, 0) || 0
	);

	const appliedCredits = derived(
		[completedCoursesStore, courseGradesStore, programCoursesStore],
		([$completed, $grades, $programCourses]) =>
			$programCourses.reduce(
				(sum, course) => sum + ($completed[course.id] && $grades[course.id] ? course.credits : 0),
				0
			) || 0
	);

	const inProgress = derived(completedCoursesStore, ($completedCoursesStore) => {
		return (
			$programCoursesStore.filter(
				(course) => !$completedCoursesStore[course.id] && arePrerequisitesMet(course)
			).length || 0
		);
	});

	const stillNeeded = derived(
		completedCoursesStore,
		($completed) => $programCoursesStore.filter((course) => !$completed[course.id]).length || 0
	);

	const complete = derived(
		completedCoursesStore,
		($completed) => $programCoursesStore.filter((course) => $completed[course.id]).length || 0
	);

	const progressPercentage = derived(
		appliedCredits,
		($applied) => ($applied / $totalCredits) * 100
	);

	const gpa = derived(
		[courseGradesStore, completedCoursesStore, programCoursesStore],
		([$grades, $completed, $programCourses]) => {
			let totalPoints = 0;
			let totalCredits = 0;

			if ($programCourses && Array.isArray($programCourses)) {
				$programCourses.forEach((course) => {
					if ($completed[course.id]) {
						const grade = $grades[course.id];
						if (grade && grade in gradePoints) {
							totalPoints += gradePoints[grade] * course.credits;
							totalCredits += course.credits;
						}
					}
				});
			}

			return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
		}
	);

	let loading = false;
	let success = false;
</script>

<div class="mt-6 overflow-hidden">
	<div class="flex flex-wrap items-start gap-x-12 px-4 py-2 text-sm">
		<div class="flex min-w-[200px] flex-col items-start">
			<span class="uppercase text-gray-500">Current Degree(S)</span>
			<div class="font-semibold">
				{#each degree.name as name}
					<div>{name}</div>
				{/each}
			</div>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Minor</span>
			<span class="font-semibold">{degree.minor}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Classification</span>
			<span class="font-semibold">{degree.classification}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Overall GPA</span>
			<span class="font-semibold">{$gpa}</span>
		</div>
		<div class="flex flex-col items-center">
			<span class="uppercase text-gray-500">Academic Standing</span>
			{#if Object.values($completedCoursesStore).filter((c) => c == true).length > 0}
				{#if parseFloat($gpa) < 2.0}
					<span class="font-semibold text-red-500">Academic Warning</span>
				{:else}
					<span class="font-semibold">Good Standing</span>
				{/if}
			{:else}
				<span class="font-semibold">None</span>
			{/if}
		</div>
	</div>
</div>

<h2 class="mb-4 text-xl font-semibold">Course Requirements</h2>

<div class="flex flex-wrap items-center justify-between gap-y-2">
	<div class="flex flex-wrap items-center gap-2">
		<Button>All Courses</Button>
		<button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
			<svg
				class="mr-1 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				></path>
			</svg>
			Still Needed ({$stillNeeded})
		</button>
		<button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
			<svg
				class="mr-1 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			In Progress ({$inProgress})
		</button>
		<button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
			<svg
				class="mr-1 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
				></path>
			</svg>
			Complete ({$complete})
		</button>
	</div>

	<div class="flex flex-col items-end">
		<div class="mb-1 text-sm text-gray-600">
			{$appliedCredits}/{$totalCredits} Credits Applied
		</div>
		<div class="w-48">
			<ProgressBar progress={$progressPercentage} size="sm" />
		</div>
	</div>
</div>

<form
	method="POST"
	action="?/saveChanges"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			await update();
			loading = false;
			success = true;
			// setTimeout(() => {
			// 	success = false;
			// }, 3000);
		};
	}}
>
	<h1 class="mb-6 text-2xl font-bold">Courses for {program.name}</h1>
	{JSON.stringify($courseGradesStore)}
	<div class="overflow-hidden bg-white shadow sm:rounded-lg">
		<ul class="divide-y divide-gray-200">
			{#each programCourses as course (course.id)}
				<CourseItem {course} {completedCoursesStore} {courseGradesStore} />
			{/each}
			{#each requirements as req}
				{#if req.type === 'POOL' && req.credits > 0}
					<PoolRequirementItem
						requirement={req}
						{completedCoursesStore}
						{courseGradesStore}
						onAddCourse={openAddCourseModal}
					/>
				{/if}
			{/each}
		</ul>
	</div>

	<Modal title="Add Elective Course" bind:open={dialogOpen}>
		<select
			name="course"
			id="course"
			class="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
		>
			<option value="">Select a course...</option>
			{#each electiveCourses.filter((electiveCourse) => $poolCourses.findIndex((poolCourse) => poolCourse.id == electiveCourse.id) === -1 && $programCoursesStore.findIndex((programCourse) => programCourse.id == electiveCourse.id) === -1) as course}
				<option value={course.id}>{course.code} - {course.name}</option>
			{/each}
		</select>
		<svelte:fragment slot="footer">
			<Button on:click={() => (dialogOpen = false)}>Close</Button>
			<Button on:click={handleAddCourse}>Add Course</Button>
		</svelte:fragment>
	</Modal>

	<div class="mt-6 text-xl font-bold">
		Overall GPA: {$gpa}
	</div>

	<div class="mt-6">
		<Button type="submit" {loading}>Save Changes</Button>
		{#if loading}
			<span class="ml-2">Saving...</span>
		{/if}
		{#if success}
			<span class="ml-2 text-green-500">Changes saved successfully</span>
		{/if}
	</div>
</form>
