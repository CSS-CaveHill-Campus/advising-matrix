<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from '../../routes/(protected)/student/degree-tracker/$types';
	import { gradePoints } from '$lib/types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let selectedCourse = {
		label: '',
		value: ''
	};
	type Course = {
		id: string;
		code: string;
		name: string;
		level: number;
		credits: number;
	};

	$: ElectiveCourseIds = data.electivesIDs;

	let cours: Course[] = [];

	onMount(() => {
		ElectiveCourseIds.forEach((id: string) => {
			const course = data.electiveCourses[0]?.courses.find((course) => course.id === id);
			if (course) {
				cours = [...cours, course];
			}
		});
	});

	$: electiveCredits = data.program.requirements
		.filter((requirement) => requirement.type === 'POOL')
		.reduce((acc, requirement) => {
			return acc + requirement.credits;
		}, 0);

	$: electiveCourses =
		data.electiveCourses[0]?.courses.filter((course) => !cours.some((c) => c.id === course.id)) ??
		[];

	$: credits = electiveCredits
		? electiveCredits - cours.reduce((acc, course) => acc + course.credits, 0)
		: 0;

	const addElectiveCourses = (event: MouseEvent) => {
		event.preventDefault();
		const course = data.electiveCourses[0]?.courses.find(
			(course) => course.id === selectedCourse.value
		);
		if (!course) return;
		cours = [...cours, course];
		localStorage.setItem('electiveCourses', JSON.stringify(cours));
		selectedCourse = {
			label: '',
			value: ''
		};
		dialogOpen = false;
	};

	async function submitElectives(event: { currentTarget: EventTarget & HTMLFormElement }) {
		buttonDisabled = true;
		const data = new FormData();
		data.append('electives', JSON.stringify(cours));

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		if (response.ok) {
			buttonDisabled = false;
			savedElectives = true;
			setTimeout(() => {
				savedElectives = false;
			}, 3000);
		} else {
			console.error('Failed to save electives');
		}
	}

	let dialogOpen = false;

	let savedElectives = false;
	let buttonDisabled = false;
</script>

<div class="container py-6">
	<div class="flex flex-wrap items-center">
		<h2 class="py-5 text-xl font-bold">
			Level 1 Electives: {#if credits > 0}Require {credits} credits for any faculty{:else}Completed{/if}
		</h2>
		{#if credits > 0}
			<Dialog.Root bind:open={dialogOpen}>
				<Dialog.Trigger class={buttonVariants({ variant: 'outline', class: 'ml-auto w-fit' })}
					>Add Elective Course</Dialog.Trigger
				>
				<Dialog.Content class="sm:max-w-[525px]">
					<Dialog.Header>
						<Dialog.Title>Add Elective Course</Dialog.Title>
						<Dialog.Description>
							Make to complete your level 1 elective courses select from below.
						</Dialog.Description>
					</Dialog.Header>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="elective" class="text-right">Course</Label>
							<Select.Root bind:selected={selectedCourse}>
								<Select.Trigger class="w-[300px]">
									<Select.Value placeholder="Select a course to add" />
								</Select.Trigger>
								<Select.Content class="max-h-[10rem] overflow-y-auto">
									{#each electiveCourses as course}
										<Select.Item value={course.id} label={course.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
					<Dialog.Footer>
						<Button type="button" on:click={addElectiveCourses}>Add Courses</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/if}
	</div>
	<div class="grid gap-5">
		<div class="overflow-hidden bg-white shadow sm:rounded-lg">
			<ul class="divide-y divide-gray-200">
				{#each cours as course}
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
										<span
											class="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
										>
											Elective
										</span>
										<Button
											variant="outline"
											size="sm"
											on:click={() => {
												(cours = cours.filter((c) => c.id !== course.id)),
													localStorage.setItem('electiveCourses', JSON.stringify(cours));
											}}
											class="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
										>
											X
										</Button>
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
	</div>

	<form action="?/saveElectives" method="post" on:submit|preventDefault={submitElectives}>
		<input type="text" hidden bind:value={cours.entries} name="electives" />
		<div class="flex items-baseline gap-4">
			<Button type="submit" disabled={buttonDisabled} class="mt-5">Save Changes</Button>
			<p class={savedElectives ? 'block' : 'hidden'}>Changes were saved</p>
		</div>
	</form>
</div>
