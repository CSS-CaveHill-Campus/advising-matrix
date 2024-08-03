<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/Card.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	function getInviteLink(inviteToken: string | null) {
		if (inviteToken === null) return '';
		if (typeof window === 'undefined') return '';
		return `${window.location.origin}/register?token=${inviteToken}`;
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString();
	}
</script>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold text-stone-800">My Students</h1>

	<Button href="/advisor/students/invite">Invite A Student</Button>
</div>

<Card>
	<div class="flex flex-col">
		<div class="-m-1.5 overflow-x-auto">
			<div class="inline-block min-w-full p-1.5 align-middle">
				<div class="overflow-hidden rounded-lg border border-gray-200">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Email</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Program</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Joined</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Last Updated</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Status</th
								>
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
									>Action</th
								>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#if data.students.length === 0}
								<tr>
									<td
										colspan="6"
										class="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500"
									>
										No students found.
									</td>
								</tr>
							{:else}
								{#each data.students as student}
									<tr class="hover:bg-gray-50">
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800"
											>{student.email}</td
										>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800"
											>{student.program_name || 'Not assigned'}</td
										>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800"
											>{formatDate(student.created_at)}</td
										>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800"
											>{formatDate(student.updated_at)}</td
										>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
											{#if student.invite_token}
												{#if student.invite_expires && new Date(student.invite_expires) > new Date()}
													<span
														class="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800"
													>
														Invited (expires {formatDate(student.invite_expires)})
													</span>
												{:else}
													<span
														class="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800"
													>
														Invitation expired
													</span>
												{/if}
											{:else}
												<span
													class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
												>
													Active
												</span>
											{/if}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
											{#if student.invite_token}
												<div class="flex items-center space-x-2">
													<CopyButton textToCopy={getInviteLink(student.invite_token)} />
													<form method="POST" action="?/removeInvite" use:enhance>
														<input type="hidden" name="studentID" value={student.id} />
														<button type="submit" class="text-red-600 hover:text-red-900">
															Remove Invite
														</button>
													</form>
												</div>
											{:else}
												<a
													href="/advisor/students/{student.user_id}"
													class="text-indigo-600 hover:text-indigo-900"
												>
													View Details
												</a>
											{/if}
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</Card>
