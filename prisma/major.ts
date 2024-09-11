import type { DB, RequirementType } from '../src/lib/db/schema';
import 'dotenv/config';
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import fs from 'fs/promises';

const { Pool } = pg;

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false
			}
		})
	})
}).withSchema('dev');

const __dirname = path.dirname(__filename);

const data = await fs.readFile(path.join(__dirname, 'majors.json'), 'utf-8');
type MajorData = {
	name: string;
	details: [
		{
			type: string;
			level: number;
			credits: number;
			data: {
				courses?: string[];
				area?: string[];
			};
		}
	];
};

const majorData: MajorData[] = JSON.parse(data);

await db.deleteFrom('MajorRequirements').execute();

for (const major of majorData) {
	const id = await db
		.selectFrom('Majors')
		.where('name', 'like', major.name)
		.select('id')
		.executeTakeFirst();
	console.log(`${major.name} - ${id?.id}`);
	for (const detail of major.details) {
		await db
			.insertInto('MajorRequirements')
			.values({
				id: crypto.randomUUID(),
				majorId: id?.id!,
				type: detail.type as RequirementType,
				level: detail.level,
				credits: detail.credits,
				details: JSON.stringify(detail.data)
			})
			.execute();
		console.log(`${detail.type} ${detail.level} ${detail.credits}`);
		if (detail.data.courses) {
			const courses = await db
				.selectFrom('Course')
				.where(
					'id',
					'in',
					detail.data.courses.map((c) => parseInt(c))
				)
				.selectAll()
				.execute();

			console.log(courses.flatMap((c) => c.name).join('\n\t'));
		}
	}
}