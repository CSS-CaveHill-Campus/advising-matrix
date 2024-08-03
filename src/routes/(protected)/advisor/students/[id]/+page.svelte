<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container mt-8 max-w-md">
	<h2 class="py-4 font-bold">View Student Invitation</h2>
	<form class="mx-auto max-w-md" method="post" action="?/delete">
		<div class="group relative z-0 mb-5 w-full">
			<input
				type="email"
				name="floating_email"
				id="floating_email"
				class="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-500 dark:focus:border-blue-500 dark:focus:text-blue-500"
				placeholder=" "
				required
				value={data.student.email}
				readonly
			/>
			<label
				for="floating_email"
				class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
				>Email address</label
			>
		</div>
		<div class="group relative z-0 mb-5 w-full">
			<input
				type="text"
				name="floating_name"
				id="floating_name"
				class="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-gray-500 dark:focus:border-blue-500 dark:focus:text-blue-500"
				placeholder=" "
				required
				value={data.student.name}
			/>
			<label
				for="floating_name"
				class="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500 rtl:peer-focus:translate-x-1/4"
				>Student Name</label
			>
		</div>
		<button
			type="submit"
			class="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
			>delete</button
		>
	</form>
</div>
