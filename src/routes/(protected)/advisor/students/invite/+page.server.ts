import { fail, type Load } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/db';
import { generateTokenWithExpiration } from '$lib/server/auth';
import { generateId } from 'lucia';
import Vine from '@vinejs/vine';
import { message, superValidate } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from '../$types';

const defaults = { email: '', name: '', programId: '' };

const schema = Vine.object({
	email: Vine.string().trim().email(),
	name: Vine.string().trim().minLength(2).maxLength(50),
	programId: Vine.string().trim()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(vine(schema, { defaults }));

	const programs = await db.selectFrom('Program').select(['id', 'name']).execute();

	return { form, programs };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADVISOR') {
			return fail(403, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, vine(schema, { defaults }));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, name, programId } = form.data;

		try {
			const advisor = await db
				.selectFrom('Advisor')
				.where('user_id', '=', locals.user.id)
				.select(['id'])
				.executeTakeFirst();

			if (!advisor) {
				return fail(404, { form, error: 'Advisor not found' });
			}

			const { expiresAt, token } = generateTokenWithExpiration();

			await db.transaction().execute(async (trx) => {
				const userId = generateId(16);

				await trx
					.insertInto('User')
					.values({
						id: userId,
						name,
						email,
						role: 'STUDENT',
						password: '',
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();

				await trx
					.insertInto('Student')
					.values({
						id: generateId(16),
						user_id: userId,
						advisor_id: advisor.id,
						program_id: programId,
						invite_token: token,
						invite_expires: new Date(expiresAt),
						created_at: new Date(),
						updated_at: new Date()
					})
					.execute();
			});

			return message(form, 'Invitation sent successfully!');
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Failed to invite student' });
		}
	}
};
