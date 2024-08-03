<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	export let data: PageData;

	let selectedMajorId: number | undefined;

	$: studentMajor = data.majors.filter((major) => major.id === data.student.program_id)[0];
</script>

<div class="py-8">
	<div class="space-y-6 px-4 sm:px-6">
		<header class="space-y-2">
			<div class="flex items-center space-x-3">
				<Avatar name={data.student.name} size="lg" />
				<div class="space-y-1">
					<h1 class="text-2xl font-bold">{data.student.name}</h1>
					<!-- <Button size="sm">Change photo</Button> -->
				</div>
			</div>
		</header>
		<div class="space-y-8">
			<Card>
				<CardContent class="space-y-6 pt-6">
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<Input id="name" placeholder="E.g. Jane Doe" value={data.student.name} />
					</div>
					<div class="grid gap-3 md:grid-cols-3">
						<div class="space-y-2 md:col-span-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								placeholder="E.g. jane@mycavehill.uwi.edu"
								value={data.student.email}
							/>
						</div>
						<div class="space-y-2">
							<Label for="level">Level</Label>
							<Select.Root>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Level" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="Level 1">Level 1</Select.Item>
									<Select.Item value="Level 2">Level 2</Select.Item>
									<Select.Item value="Level 3">Level 3</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<div>Undergraduate Major</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						<Label for="level">Undergraduate Major</Label>
						<Select.Root>
							<Select.Trigger class="w-full">
								<Select.Value placeholder={studentMajor?.name} />
							</Select.Trigger>
							<Select.Content>
								{#each data.majors as major}
									<Select.Item value={major.id}>{major.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<div>Alternative Email</div>
					<div>For your security, please use your offical university email.</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="alternative-email">Alternative Email</Label>
						<Input type="email" id="alternative-email" />
					</div>
					<div class="space-y-2">
						<Label for="alternative-email1">Confirm Alternative Email</Label>
						<Input type="email" id="alternative-email1" />
					</div>
				</CardContent>
			</Card>
		</div>
		<div class="pt-6">
			<Button>Save</Button>
		</div>
	</div>
</div>
