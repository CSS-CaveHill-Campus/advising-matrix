import { db } from '$lib/db';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ProgramRequirement, RequirementDetails } from '$lib/types';
import type { Course, RequirementType } from '$lib/db/schema';
import { generateId } from 'lucia';

// async function getStudentId(userId: string): Promise<string | null> {
// 	return await db
// 		.selectFrom('Student')
// 		.where('user_id', '=', userId)
// 		.select('id')
// 		.executeTakeFirst()
// 		.then((result) => result?.id ?? null);
// }

// async function getProgram(programName: string) {
// 	const program = await db
// 		.selectFrom('Program')
// 		.leftJoin('ProgramRequirement', 'Program.id', 'ProgramRequirement.programId')
// 		.select([
// 			'Program.id',
// 			'Program.name',
// 			'ProgramRequirement.id as requirementId',
// 			'ProgramRequirement.programId',
// 			'ProgramRequirement.type',
// 			'ProgramRequirement.credits',
// 			'ProgramRequirement.details'
// 		])
// 		.where('Program.name', '=', programName)
// 		.execute();

// 	if (!program.length) return null;

// 	const requirements: ProgramRequirement[] = program.map((req) => ({
// 		id: req.requirementId!,
// 		programId: req.programId!,
// 		type: req.type as RequirementType,
// 		credits: req.credits!,

// 		details:
// 			typeof req.details === 'string'
// 				? JSON.parse(req.details)
// 				: (req.details as RequirementDetails)
// 	}));

// 	return {
// 		id: program[0]!.id,
// 		name: program[0]!.name,
// 		requirements
// 	};
// }

// async function getCourses(courseIds: string[]) {
// 	const [courses, prerequisites] = await Promise.all([
// 		db.selectFrom('Course').where('id', 'in', courseIds).selectAll().execute(),
// 		db
// 			.selectFrom('CoursePrerequisite as CP')
// 			.innerJoin('Course as C', 'CP.prerequisiteId', 'C.id')
// 			.where('CP.courseId', 'in', courseIds)
// 			.select([
// 				'CP.courseId',
// 				'CP.prerequisiteId',
// 				'C.code as prerequisiteCode',
// 				'C.name as prerequisiteName'
// 			])
// 			.execute()
// 	]);

// 	return courses.map((course: Course) => ({
// 		...course,
// 		prerequisites: prerequisites
// 			.filter((prereq) => prereq.courseId === course.id)
// 			.map(({ prerequisiteId, prerequisiteCode, prerequisiteName }) => ({
// 				id: prerequisiteId,
// 				code: prerequisiteCode,
// 				name: prerequisiteName
// 			}))
// 	}));
// }

// async function getElectiveCourses(requirements: ProgramRequirement[]) {
// 	const poolRequirements = requirements.filter((req) => req.type === 'POOL');
// 	const electiveCoursesByRequirement = await Promise.all(
// 		poolRequirements.map(async (req) => {
// 			const details = req.details as {
// 				levelPool: string[];
// 				facultyPool: string[] | 'any' | 'anyother';
// 			};
// 			let query = db
// 				.selectFrom('Course')
// 				.select(['id', 'code', 'name', 'level', 'credits'])
// 				.where(
// 					'level',
// 					'in',
// 					details.levelPool.map((level) => (level === 'I' ? 1 : level === 'II' ? 2 : 3))
// 				);

// 			if (details.facultyPool === 'anyother') {
// 				query.where('Course.departmentId', '!=', 'Department.id');
// 			} else if (details.facultyPool !== 'any') {
// 				query = query
// 					.innerJoin('Department', 'Department.id', 'Course.departmentId')
// 					.where('Department.name', 'in', details.facultyPool);
// 			}

// 			const courses = await query.execute();
// 			return {
// 				requirementId: req.id,
// 				courses: courses
// 			};
// 		})
// 	);

// 	return electiveCoursesByRequirement;
// }

// async function getStudentCourses(studentId: string) {
// 	return await db
// 		.selectFrom('StudentCourse')
// 		.selectAll()
// 		.where('studentId', '=', studentId)
// 		.execute()
// 		.then((courses) =>
// 			courses.reduce(
// 				(acc, sc) => {
// 					acc[sc.courseId] = { id: sc.id, grade: sc.grade };
// 					return acc;
// 				},
// 				{} as Record<string, { id: string; grade: string }>
// 			)
// 		);
// }

// const getlevel1electives = async () => {
// 	const courses = await db
// 		.selectFrom('Course')
// 		.selectAll()
// 		.where('Course.code', 'like', '____1%')
// 		.execute();

// 	return courses;
// };

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) throw error(401, 'Unauthorized');

	const program = await db
		.selectFrom('Student')
		.innerJoin('Program', 'Student.program_id', 'Program.id')
		.where('Student.user_id', '=', userId)
		.selectAll()
		.executeTakeFirst();

	if (!program) throw error(404, 'Program not found');

	const programRequirements = await db
		.selectFrom('ProgramRequirement')
		.where('programId', '=', program.program_id)
		.selectAll()
		.execute();

	const programCore = programRequirements.find((req) => req.type === 'CREDITS');

	if (!programCore) throw error(404, 'Core requirements not found');

	const programElectives = programRequirements.filter((req) => req.type === 'POOL');

	const programCourses = await db
		.selectFrom('Course')
		.where('id', 'in', programCore.details.courses)
		.selectAll()
		.execute();

	const electiveCourses = await db
		.selectFrom('Course')
		.where('Course.code', 'like', '____1%')
		.where('Course.id', 'not in', programCore.details.courses)
		.selectAll()
		.execute();

	const studentCourses = await db
		.selectFrom('Student')
		.innerJoin('StudentCourse', 'StudentCourse.studentId', 'Student.id')
		.where('Student.user_id', '=', userId)
		.selectAll()
		.execute();

	return {
		program,
		programRequirements,
		programCourses,
		electiveCourses,
		programElectives,
		studentCourses
	};

	// const studentId = await getStudentId(userId);
	// if (!studentId) throw error(404, 'Student not found');

	// const program = await getProgram('Computer Science');
	// if (!program) throw error(404, 'Program not found');

	// const [programCourses, electiveCourses, studentCourses] = await Promise.all([
	// 	getCourses(
	// 		program.requirements.flatMap((req) =>
	// 			req.type === 'CREDITS' && 'courses' in req.details ? req.details.courses : []
	// 		)
	// 	),
	// 	getElectiveCourses(program.requirements),
	// 	getStudentCourses(studentId)
	// ]);

	// // *Debugging
	// console.log('Program:', program);
	// console.log('Program Courses:', programCourses);
	// console.log('Elective Courses:', electiveCourses);
	// console.log('Student Courses:', studentCourses);
	// console.log('Requirements:', program.requirements);

	// return {
	// 	program,
	// 	programCourses,
	// 	electiveCourses,
	// 	studentCourses,
	// 	requirements: program.requirements,
	// 	level1electives: await getlevel1electives()
	// };
};

// export const actions: Actions = {
// 	saveChanges: async ({ request, locals }) => {
// 		const userId = locals.user?.id;
// 		if (!userId) return fail(401, { message: 'Unauthorized' });

// 		const studentId = await getStudentId(userId);
// 		if (!studentId) return fail(404, { message: 'Student not found' });

// 		const formData = await request.formData();
// 		const courseEntries = Array.from(formData.entries())
// 			.filter(([key, value]) => key.startsWith('courses[') && key.endsWith('].grade'))
// 			.map(([key, value]) => ({
// 				courseId: key.slice(8, -7),
// 				grade: value as string
// 			}));

// 		try {
// 			await db.transaction().execute(async (trx) => {
// 				await trx.deleteFrom('StudentCourse').where('studentId', '=', studentId).execute();

// 				for (const { courseId, grade } of courseEntries) {
// 					if (grade) {
// 						await trx
// 							.insertInto('StudentCourse')
// 							.values({
// 								id: generateId(16),
// 								studentId,
// 								courseId,
// 								grade
// 							})
// 							.execute();
// 					}
// 				}
// 			});

// 			return { success: true };
// 		} catch (err) {
// 			console.error('Error saving changes:', err);
// 			return fail(500, { message: 'Failed to save changes' });
// 		}
// 	},

// 	addElectives: async ({ request, locals }) => {
// 		const data = await request.formData();
// 		const electiveID = data.get('elective');

// 		if (!electiveID) {
// 			return fail(400, { message: 'Elective ID is required' });
// 		}

// 		const existingElectives = await db
// 			.selectFrom('Student')
// 			.select('electivePool')
// 			.where('user_id', '=', locals.user!.id)
// 			.executeTakeFirst();

// 		if (!existingElectives) {
// 			return fail(404, { message: 'Student not found' });
// 		}

// 		let updatedElectivePool = existingElectives.electivePool;

// 		if (!updatedElectivePool) {
// 			updatedElectivePool = [];
// 		} else if (updatedElectivePool.includes(electiveID.toString())) {
// 			return fail(400, { message: 'Elective already added' });
// 		}

// 		if (!updatedElectivePool.includes(electiveID.toString())) {
// 			updatedElectivePool.push(electiveID.toString());
// 		}

// 		const res = await db
// 			.updateTable('Student')
// 			.set({ electivePool: updatedElectivePool })
// 			.where('user_id', '=', locals.user!.id)
// 			.execute();

// 		return { success: true };
// 	}
// };
