<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import RequestAccess from '$lib/components/RequestAccess.svelte';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import type { ActionData, PageData } from './$types';
	import PasswordRequirements from '$lib/components/PasswordRequirements.svelte';

	export let data: PageData;
	export let form: ActionData;

	let password = '';
	let confirmPassword = '';

	$: isPasswordValid =
		password.length >= 8 &&
		/[A-Z]/.test(password) &&
		password === confirmPassword &&
		password !== '';

	// $: console.log({ password, confirmPassword, isPasswordValid });
</script>

{#if data.token}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#fdfdfc] to-[#f9f9f8] font-sans py-8 px-6"
	>
		<div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
			<div class="mb-8 flex justify-center">
				<img src={uwiBanner} alt="UWI Banner" class="h-auto max-w-full" />
			</div>

			<h1 class="mb-2 text-center text-2xl font-semibold text-gray-800">Complete Registration</h1>
			<p class="mb-8 text-center text-sm text-gray-600">Set your account password</p>

			{#if form?.error}
				<div
					class="mb-4 mt-4 rounded-md border border-red-400 bg-red-100 p-4 text-red-700"
					role="alert"
				>
					<p>{form.error}</p>
				</div>
			{/if}

			<form method="POST" action="?/register" use:enhance class="space-y-4">
				<input type="hidden" name="token" value={data.token} />
				<Input
					type="password"
					id="password"
					name="password"
					label="Password"
					placeholder="Enter your password"
					required
					bind:value={password}
				/>
				<Input
					type="password"
					id="confirm-password"
					name="confirm-password"
					label="Confirm Password"
					placeholder="Confirm your password"
					required
					bind:value={confirmPassword}
				/>
				<PasswordRequirements {password} {confirmPassword} />
				<button
					type="submit"
					class="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!isPasswordValid}
				>
					Complete Registration
				</button>
			</form>
		</div>
	</div>
{:else}
	<RequestAccess />
{/if}
