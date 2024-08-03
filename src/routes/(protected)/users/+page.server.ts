import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const users = await db.selectFrom('User').selectAll().execute();
	return { users };
}) satisfies PageServerLoad;
