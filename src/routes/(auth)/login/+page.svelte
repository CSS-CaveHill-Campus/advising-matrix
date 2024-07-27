<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import Button from '$lib/components/ui/Button.svelte';
	import { superForm } from 'sveltekit-superforms';
	export let data;

	const { form, errors, constraints, enhance, submitting, delayed, timeout } = superForm(
		data.loginForm,
		{
			delayMs: 500,
			timeoutMs: 8000
		}
	);
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] font-sans"
>
	<div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
		<div class="mb-8 flex justify-center">
			<img src={uwiBanner} alt="UWI Banner" />
		</div>

		<h1 class="mb-2 text-center text-2xl font-semibold text-gray-800">Welcome back</h1>
		<p class="mb-8 text-center text-sm text-gray-600">Please enter your details to sign in</p>

		{#if $errors._errors}
			<div class="mb-4 rounded-md border border-red-400 bg-red-100 p-4 text-red-700">
				<p>{$errors._errors[0]}</p>
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-4">
			<Input
				type="email"
				id="email"
				name="email"
				label="Email address"
				placeholder="Enter your email"
				required
				error={$errors.email?.[0]}
				bind:value={$form.email}
				{...$constraints.email}
			/>

			<Input
				type="password"
				id="password"
				name="password"
				label="Password"
				placeholder="Enter your password"
				required
				error={$errors.password?.[0]}
				bind:value={$form.password}
				{...$constraints.password}
			/>

			<div class="flex items-center justify-center">
				<a href="/forgot-password" class="text-sm text-indigo-600 hover:underline">
					Forgot password?
				</a>
			</div>

			<Button type="submit" fullWidth loading={$submitting}>Sign in</Button>
		</form>

		<p class="mt-6 text-center text-sm text-gray-600">
			Need access? <a href="/request-access" class="font-medium text-indigo-600 hover:underline"
				>Request here</a
			>
		</p>
	</div>
</div>
