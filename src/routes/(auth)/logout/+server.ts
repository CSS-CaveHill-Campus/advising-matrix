import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lucia } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) {
		return error(401, 'Unauthorized');
	}

	await lucia.invalidateSession(locals.session.id);
	const sessionCookie = lucia.createBlankSessionCookie();

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	return json({ success: true });
};