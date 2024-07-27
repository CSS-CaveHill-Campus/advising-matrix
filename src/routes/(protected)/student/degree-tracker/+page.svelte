<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { gradePoints, type Grade } from '$lib/types';
	import { derived, writable } from 'svelte/store';
	import type { Course } from '$lib/db/schema';
	import ElectiveCourses from '$lib/components/ElectiveCourses.svelte';
	import StudentMajorDetails from '$lib/components/StudentMajorDetails.svelte';
	import { Button } from '$lib/components/ui/button';
	import Progress from '$lib/components/ui/progress/progress.svelte';

	export let data: PageData;

	const courseGradesStore = writable<Record<string, Grade | ''>>({});
	const completedCoursesStore = writable<Record<string, boolean>>({});
	const electiveCoursesStore = writable<string[]>([]);

	function arePrerequisitesMet(
		course: Course & { prerequisites: { id: string; code: string; name: string }[] }
	): boolean {
		if (!course.prerequisites || course.prerequisites.length === 0) {
			return true;
		}
		return course.prerequisites.every((prereq) => $completedCoursesStore[prereq.id]);
	}

	$: ({ program, programCourses, electiveCourses, studentCourses, programRequirements } = data);

	$: if (programCourses && studentCourses) {
		const grades: Record<string, Grade | ''> = {};
		const completed: Record<string, boolean> = {};

		programCourses.forEach((course: Course) => {
			const grade = studentCourses[course.id]?.grade;
			grades[course.id] = (grade && grade in gradePoints ? grade : '') as Grade | '';
			completed[course.id] = !!grade && arePrerequisitesMet(course);
		});

		courseGradesStore.set(grades);
		completedCoursesStore.set(completed);
	}

	

	// $: creditsAmt = studentElectiveCourses.reduce((acc, course) => acc + course.credits, 0);

	// $: console.log('Program Courses:', programCourses);
	// $: console.log('Completed Courses Store:', $completedCoursesStore);
</script>

<!-- <pre>{JSON.stringify(data.studentCourses, null, 2)}</pre> -->
<div class="container p-0">
	<StudentMajorDetails {data} />
	<h2 class="py-4 text-xl font-semibold">Course Requirements</h2>
	<div class="flex flex-wrap justify-between gap-y-2">
		<div class="flex flex-wrap items-center gap-2">
			<Button
				class="rounded-md px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 "
				>All Courses</Button
			>
			<Button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700  font-medium  shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-white ">
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
				Still Needed (stillNeeded)
			</Button>
			<Button class="flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700  font-medium  shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-white ">
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
				In Progress (inProgress)
			</Button>
			<Button class="fflex items-center rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700  font-medium  shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-white ">
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
				Complete (complete)
			</Button>
		</div>
	
		<div class="flex flex-col items-end">
			<div class="mb-1 text-sm text-gray-600">15 / 24 Credits Applied</div>
			<div class="w-48">
				<Progress value={15} max={24}/>
			</div>
		</div>
	</div>

	<h1 class="py-6 text-2xl font-bold">Degree Courses</h1>

	<h2 class="mb-2 text-xl font-bold">Level 1 Core</h2>

	<div class="overflow-hidden bg-white shadow sm:rounded-lg">
		<ul class="divide-y divide-gray-200">
			{#each data.programCourses as course}
				<li>
					<div class="flex items-center px-4 py-4 sm:px-6">
						<div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
							<div>
								<div class="flex items-center">
									<input
										type="checkbox"
										id={`course-${course.id}`}
										name={`course-${course.id}`}
										class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
										disabled
									/>
									<!-- Course Name -->
									<label for={`course-${course.id}`} class="ml-3 block">
										<span class="font-medium text-gray-900">{course.code}</span>
										<span class="ml-1 text-gray-500">{course.name}</span>
									</label>
								</div>
								<!-- Course level and Credits -->
								<div class="mt-1 flex items-center text-sm text-gray-500">
									<span>Level: {course.level}</span>
									<span
										class="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
									>
										{course.credits} Credits
									</span>
								</div>
							</div>
							<!-- Grade Selection Logic -->
							<div class="mt-4 flex-shrink-0 sm:ml-5 sm:mt-0">
								<select
									name={`course-${course.id}-grade`}
									value=""
									class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
			{/each}
		</ul>
	</div>

	
	<ElectiveCourses {data} />
</div>





