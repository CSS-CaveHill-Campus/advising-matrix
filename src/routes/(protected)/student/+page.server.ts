import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const data = await db
		.selectFrom('Student')
		.select(['Student.id', 'Student.user_id'])
		.where('Student.user_id', '=', userId)
		.executeTakeFirst();
	if (!data) {
		return {
			student: null
		};
	}
	return {
		student: data
	};
}) satisfies PageServerLoad;
