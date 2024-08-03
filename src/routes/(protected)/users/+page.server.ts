import { db } from '$lib/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') {
		return fail(401, { message: 'Unauthorized' });
	}
	const users = await db.selectFrom('User').where('User.role', '<>', 'ADMIN').selectAll().execute();
	return { users };
}) satisfies PageServerLoad;
