<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Select from '$lib/components/ui/dropdown/Select.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Option from '$lib/components/ui/dropdown/Option.svelte';
	import { superForm } from 'sveltekit-superforms';

	export let data;

	const { form, constraints, errors, enhance, delayed, message } = superForm(data.form, {
		delayMs: 500
	});
</script>

<h1 class="mb-4 text-2xl font-bold">Invite Student</h1>

<form method="POST" use:enhance class="space-y-4">
	<div>
		<Input
			type="text"
			id="name"
			name="name"
			label="Student Name"
			placeholder="Enter student's name"
			required
			error={$errors.name?.[0]}
			bind:value={$form.name}
			{...$constraints.name}
		/>

		<Input
			type="email"
			id="email"
			name="email"
			label="Student Email"
			placeholder="Enter student's email"
			required
			error={$errors.email?.[0]}
			bind:value={$form.email}
			{...$constraints.email}
		/>

		<Select
			id="programId"
			name="programId"
			label="Program"
			placeholder="Select a program"
			error={$errors.programId?.[0]}
			bind:value={$form.programId}
		>
			{#each data.programs as program}
				<Option value={program.id}>{program.name}</Option>
			{/each}
		</Select>
	</div>

	<Button type="submit" loading={$delayed}>Send Invitation</Button>
</form>

{#if $message}
	<p class="mt-4 text-sm text-green-600">{$message}</p>
{/if}

{#if $errors._errors}
	<p class="mt-4 text-sm text-red-600">{$errors._errors[0]}</p>
{/if}
