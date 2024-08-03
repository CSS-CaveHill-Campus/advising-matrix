import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/db';
import { Argon2id } from 'oslo/password';

export const load: PageServerLoad = async ({ url, locals }) => {
	const token = url.searchParams.get('token');
	if (locals.user) {
		throw redirect(302, '/');
	}

	if (token) {
		// Validate token
		try {
			const student = await db
				.selectFrom('Student')
				.where('invite_token', '=', token)
				.select(['id', 'invite_expires'])
				.executeTakeFirst();

			if (!student || (student.invite_expires && new Date(student.invite_expires) < new Date())) {
				return { token: null, error: 'Invalid or expired invitation' };
			}
		} catch (error) {
			console.error('Database error:', error);
			return { token: null, error: 'An error occurred. Please try again later.' };
		}
	}

	return { token };
};

export const actions: Actions = {
	register: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const token = data.token as string;
		const password = data.password as string;

		try {
			// const validator = vine.compile(schema);
			// const validatedData = await validator.validate(data);

			// const { token, password } = validatedData;

			const student = await db
				.selectFrom('Student')
				.where('invite_token', '=', token)
				.select(['id', 'user_id', 'invite_expires'])
				.executeTakeFirst();

			if (!student || (student.invite_expires && new Date(student.invite_expires) < new Date())) {
				return fail(400, { error: 'Invalid or expired invitation' });
			}

			const hashedPassword = await new Argon2id().hash(password);

			await db.transaction().execute(async (trx) => {
				await trx
					.updateTable('User')
					.set({ password: hashedPassword })
					.where('id', '=', student.user_id)
					.execute();

				await trx
					.updateTable('Student')
					.set({ invite_token: null, invite_expires: null })
					.where('id', '=', student.id)
					.execute();
			});
		} catch (err) {
			// if (err instanceof errors.E_VALIDATION_ERROR) {
			// 	return fail(400, {
			// 		error: 'Validation failed',
			// 		errors: err.messages
			// 	});
			// }

			console.error('Error during registration:', err);
			return fail(500, { error: 'An error occurred during registration. Please try again.' });
		}
		return redirect(302, '/login?message=registration_complete');
	}
};
