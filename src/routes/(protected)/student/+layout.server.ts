import { requiredRole } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	await requiredRole('STUDENT')(event);
	return {
		user: event.locals.user
	};
};
