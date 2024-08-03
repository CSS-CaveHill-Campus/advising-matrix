import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const courses = await db
			.selectFrom('Course')
			.select(['id', 'code', 'name', 'level', 'credits'])
			.orderBy('code', 'asc')
			.execute();

		return {
			courses
		};
	} catch (err) {
		console.error(err);
		throw error(500, 'An error occurred while fetching the advisor');
	}
};
