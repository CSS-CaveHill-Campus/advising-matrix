import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load = (async ({ locals, params }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const data = await db
		.selectFrom('User')
		.select(['User.email', 'User.id', 'User.name', 'created_at', 'updated_at', 'User.role'])
		.where('User.id', '=', params.id)
		.executeTakeFirst();

	if (!data) {
		throw error(404, 'Not found');
	}

	if (data.role !== 'STUDENT') {
		throw error(403, 'Forbidden');
	}

	return { student: data };
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('floating_email');
		if (!email) {
			throw error(400, 'Bad Request');
		}
		const result = await db.deleteFrom('User').where('email', '=', email.toString()).execute();

		console.log(result);

		redirect(304, '/advisor/students');
	}
};
