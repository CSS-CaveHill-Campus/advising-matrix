import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async () => {
	return redirect(303, '/request-access');
}) satisfies PageLoad;