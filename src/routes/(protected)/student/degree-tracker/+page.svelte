<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { gradePoints, type Grade } from '$lib/types';
	import { derived, writable } from 'svelte/store';
	import type { PageData } from './$types';
	import type { Course } from '$lib/db/schema';

	export let data: PageData & {
		programCourses: (Course & {
			prerequistes: Course[];
		})[];
	};

	$: ({ program, programCourses, studentCourses } = data);

	let degree = {
		name: ['BSc Computer Science', 'BSc Mathematics'],
		minor: 'N/A',
		classification: 'Level III/Third Year'
	};

	const courseGradesStore = writable<Record<string, Grade | ''>>({});
	const completedCoursesStore = writable<Record<string, boolean>>({});

	$: if (programCourses && studentCourses) {
		courseGradesStore.set(
			Object.fromEntries(
				programCourses.map((course) => {
					const grade = studentCourses[course.id]?.grade;
					return [course.id, (grade && grade in gradePoints ? grade : '') as Grade | ''];
				})
			) as Record<string, Grade | ''>
		);
		completedCoursesStore.set(
			Object.fromEntries(
				programCourses.map((course) => [course.id, !!studentCourses[course.id]?.grade])
			)
		);
	}

	function updateGrade(courseId: string, grade: Grade) {
		courseGradesStore.update((grades) => ({ ...grades, [courseId]: grade }));
		completedCoursesStore.update((completed) => ({ ...completed, [courseId]: !!grade }));
	}

	function handleGradeChange(courseId: string, event: Event) {
		const target = event.target as HTMLSelectElement;
		updateGrade(courseId, target.value as Grade);
	}

	$: totalCredits = programCourses?.reduce((sum, course) => sum + course.credits, 0) || 0;
	$: appliedCredits = derived(
		[completedCoursesStore, courseGradesStore],
		([$completed, $grades]) =>
			programCourses?.reduce(
				(sum, course) => sum + ($completed[course.id] && $grades[course.id] ? course.credits : 0),
				0
			) || 0
	);

	$: stillNeeded = derived(
		completedCoursesStore,
		($completed) => programCourses?.filter((course) => !$completed[course.id]).length || 0
	);
	$: inProgress = 5; // This should be calculated based on actual data
	$: complete = derived(
		completedCoursesStore,
		($completed) => programCourses?.filter((course) => $completed[course.id]).length || 0
	);

	$: progressPercentage = derived(appliedCredits, ($applied) => ($applied / totalCredits) * 100);

	const gpa = derived([courseGradesStore, completedCoursesStore], ([$grades, $completed]) => {
		if (!programCourses) return '0.00';

		let totalPoints = 0;
		let totalCredits = 0;

		programCourses.forEach((course) => {
			if ($completed[course.id]) {
				const grade = $grades[course.id];
				if (grade && grade in gradePoints) {
					totalPoints += gradePoints[grade] * course.credits;
					totalCredits += course.credits;
				}
			}
		});

		return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
	});

	$: if (programCourses && studentCourses) {
		completedCoursesStore.set(
			Object.fromEntries(
				programCourses.map((course) => [
					course.id,
					!!studentCourses[course.id]?.grade && arePrerequisitesMet(course)
				])
			)
		);
	}

	function arePrerequisitesMet(
		course: Course & { prerequisites?: { id: string; code: string }[] }
	): boolean {
		if (!course.prerequisites || course.prerequisites.length === 0) {
			return true;
		}
		return course.prerequisites.every((prereq) => $completedCoursesStore[prereq.id]);
	}

	// $: console.log('Program Courses:', programCourses);
	// $: console.log('Completed Courses Store:', $completedCoursesStore);
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
			{#if parseFloat($gpa) < 2.0}
				<span class="font-semibold text-red-500">Academic Warning</span>
			{:else}
				<span class="font-semibold">Good Standing</span>
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
			Still Needed ({stillNeeded})
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
			In Progress ({inProgress})
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
			Complete ({complete})
		</button>
	</div>

	<div class="flex flex-col items-end">
		<div class="mb-1 text-sm text-gray-600">
			{$appliedCredits}/{totalCredits} Credits Applied
		</div>
		<div class="w-48">
			<ProgressBar progress={$progressPercentage} size="sm" />
		</div>
	</div>
</div>

<form method="POST" action="?/saveChanges" use:enhance>
	<h1 class="mb-6 text-2xl font-bold">Courses for {program.name}</h1>

	<div class="overflow-hidden bg-white shadow sm:rounded-lg">
		<ul class="divide-y divide-gray-200">
			{#each programCourses as course (course.id)}
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
									<div class="mt-1 text-sm">
										<span class="font-bold text-red-500">Prerequisites: </span>
										<span class="text-gray-700">
											{#each course.prerequisites as prereq}
												{#if !$completedCoursesStore[prereq.id]}
													<span class="mr-2">{prereq.code}</span>
												{/if}
											{/each}
										</span>
									</div>
								{/if}
							</div>
							<div class="mt-4 flex-shrink-0 sm:ml-5 sm:mt-0">
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
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>

	<div class="mt-6 text-xl font-bold">
		Overall GPA: {$gpa}
	</div>

	<div class="mt-6">
		<Button type="submit">Save Changes</Button>
	</div>
</form>
