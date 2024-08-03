import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config';
import type { Course, DB } from '../src/lib/db/schema';
import { Argon2id } from 'oslo/password';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const argon2id = new Argon2id();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL
		})
	})
});

async function seed() {
	console.log('Seeding database...');
	const hashedPassword = await argon2id.hash('password');

	const courseDataRaw = await fs.readFile(path.join(__dirname, 'courses.json'), 'utf-8');
	const courseData = JSON.parse(courseDataRaw);

	async function insertOrIgnore<TE extends keyof DB & string>(
		table: TE,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: any
	) {
		try {
			await db.insertInto(table).values(data).execute();
			console.log(`Inserted into ${table}`);
		} catch (error) {
			if (error.code === '23505') {
				// Unique violation error code
				console.log(`Record already exists in ${table}, skipping`);
			} else {
				throw error;
			}
		}
	}

	// Insert Users
	await insertOrIgnore('User', {
		id: '1',
		name: 'Admin',
		email: 'admin@uwi.edu',
		role: 'ADMIN',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	db.updateTable('User').set('name', 'Admin').where('User.id', '=', '1').execute();

	await insertOrIgnore('User', {
		id: '2',
		name: 'Advisor',
		email: 'advisor@uwi.edu',
		role: 'ADVISOR',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	db.updateTable('User').set('name', 'Advisor').where('User.id', '=', '2').execute();

	await insertOrIgnore('User', {
		id: '3',
		name: 'Student',
		email: 'student@uwi.edu',
		role: 'STUDENT',
		password: hashedPassword,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	db.updateTable('User').set('name', 'Student').where('User.id', '=', '3').execute();

	// Insert Advisor
	await insertOrIgnore('Advisor', {
		id: '1',
		user_id: '2'
	});

	// Insert Student
	await insertOrIgnore('Student', {
		id: '1',
		user_id: '3',
		advisor_id: '1',
		invite_token: null,
		program_id: 1,
		invite_expires: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	});

	const deparments: { id: string; name: string }[] = [
		{
			id: '1',
			name: 'Biochemistry'
		},
		{
			id: '2',
			name: 'Biology'
		},
		{
			id: '3',
			name: 'Ecology'
		},
		{
			id: '4',
			name: 'Microbiology'
		},
		{
			id: '5',
			name: 'Environmental Science'
		},
		{
			id: '6',
			name: 'Chemistry'
		},
		{
			id: '7',
			name: 'Computer Science'
		},
		{
			id: '8',
			name: 'Information Technology'
		},
		{
			id: '9',
			name: 'Software Engineering'
		},
		{
			id: '10',
			name: 'Mathematics'
		},
		{
			id: '11',
			name: 'Electronics'
		},
		{
			id: '12',
			name: 'Physics'
		},
		{
			id: '13',
			name: 'Meteorology'
		}
	];

	for (const department of deparments) {
		await insertOrIgnore('Department', department);
	}

	// Insert Departments
	await insertOrIgnore('Department', {
		id: '1',
		name: 'Computer Science'
	});

	// Insert Majors
	// await insertOrIgnore('Major', {
	// 	id: '1',
	// 	name: 'Computer Science',
	// 	department_id: '1'
	// });

	// Insert Courses
	for (const course of courseData) {
		await insertOrIgnore('Course', {
			id: course.id,
			code: course.code,
			name: course.name,
			level: parseInt(course.code.match(/\d+/)[0][0]),
			credits: course.credits,
			departmentId: course.department
		} as Course);

		if (course.prerequisite) {
			console.log(`Inserting prerequisites for ${course.code}`);
			for (const prerequisiteId of course.prerequisite) {
				try {
					await db
						.insertInto('CoursePrerequisite')
						.values({
							id: randomUUID(),
							courseId: course.id,
							prerequisiteId: prerequisiteId
						})
						.execute();
					console.log(`Inserted prerequisite ${prerequisiteId} for course ${course.id}`);
				} catch (error) {
					if (error.code === '23505') {
						// Unique constraint violation (prerequisite already exists)
						console.log(
							`Prerequisite ${prerequisiteId} for course ${course.id} already exists, skipping`
						);
					} else {
						console.error(
							`Error inserting prerequisite ${prerequisiteId} for course ${course.id}:`,
							error
						);
					}
				}
			}
		}
	}

	try {
		// Insert Computer Science Program
		const programId = randomUUID();
		await insertOrIgnore('Program', {
			id: programId,
			name: 'Computer Science'
		});

		const requirementId = randomUUID();
		const requirementDetails = {
			courses: ['150', '9508', '197', '12804', '154']
		};

		await insertOrIgnore('ProgramRequirement', {
			id: requirementId,
			programId: programId,
			type: 'CREDITS',
			credits: requirementDetails.courses.length * 3, // Assuming each course is 3 credits
			details: JSON.stringify(requirementDetails)
		});

		console.log('Computer Science program seeded successfully');
	} catch (error) {
		console.error('Error inserting program:', error);
	}
}

seed()
	.then(() => {
		console.log('Database seeded successfully');
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
