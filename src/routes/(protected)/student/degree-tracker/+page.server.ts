import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ProgramRequirement, RequirementDetails } from '$lib/types';
import type { Course, RequirementType } from '$lib/db/schema';
import { fail, superValidate } from 'sveltekit-superforms';
import { generateId } from 'lucia';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	// const student = await db
	// 	.selectFrom('Student')
	// 	.where('Student.user_id', '=', userId)
	// 	.executeTakeFirst();

	// if (!student) {
	// 	throw error(404, 'Student not found');
	// }

	const courses = await db
		.selectFrom('Course')
		.selectAll()
		.where('Course.departmentId', '=', '1')
		.execute();

	const student = await db
		.selectFrom('Student')
		.where('Student.user_id', '=', userId)
		.select('id')
		.executeTakeFirst();

	const studentCourses = await db
		.selectFrom('StudentCourse')
		.selectAll()
		.where('StudentCourse.studentId', '=', student!.id)
		.execute();

	const program = await db
		.selectFrom('Program')
		.leftJoin('ProgramRequirement', 'Program.id', 'ProgramRequirement.programId')
		.select([
			'Program.id',
			'Program.name',
			'ProgramRequirement.id as requirementId',
			'ProgramRequirement.type',
			'ProgramRequirement.credits',
			'ProgramRequirement.details'
		])
		.where('Program.name', '=', 'Computer Science')
		.executeTakeFirst();

	if (!program) {
		throw error(404, 'Program not found');
	}

	const parsedDetails: RequirementDetails =
		typeof program.details === 'string'
			? JSON.parse(program.details)
			: (program.details as RequirementDetails);

	const programRequirement: ProgramRequirement = {
		id: program.requirementId!,
		programId: program.id,
		type: program.type as RequirementType,
		credits: program.credits!,
		details: parsedDetails
	};

	let programCourses: Course[] = [];
	if (programRequirement.type === 'CREDITS' && 'courses' in programRequirement.details) {
		programCourses = await db
			.selectFrom('Course')
			.selectAll()
			.where('Course.id', 'in', programRequirement.details.courses)
			.execute();
	}

	const programCoursesWithPrerequisites = await db
		.selectFrom('Course as C')
		.leftJoin('CoursePrerequisite as CP', 'C.id', 'CP.courseId')
		.leftJoin('Course as PrereqCourse', 'CP.prerequisiteId', 'PrereqCourse.id')
		.select([
			'C.id',
			'C.code',
			'C.name',
			'C.level',
			'C.credits',
			'C.departmentId',
			'PrereqCourse.id as prereqId',
			'PrereqCourse.code as prereqCode',
			'PrereqCourse.name as prereqName'
		])
		.execute();

	const coursesMap = new Map<
		string,
		Course & { prerequisites: { id: string; code: string; name: string }[] }
	>();

	programCoursesWithPrerequisites.forEach((row) => {
		if (!coursesMap.has(row.id)) {
			coursesMap.set(row.id, {
				id: row.id,
				code: row.code,
				name: row.name,
				level: row.level,
				credits: row.credits,
				departmentId: row.departmentId,
				prerequisites: []
			});
		}

		const course = coursesMap.get(row.id)!;
		if (row.prereqId) {
			course.prerequisites.push({
				id: row.prereqId,
				code: row.prereqCode!,
				name: row.prereqName!
			});
		}
	});

	console.log(studentCourses);

	const studentCoursesMap = studentCourses.reduce(
		(acc, sc) => {
			acc[sc.courseId] = {
				id: sc.id,
				grade: sc.grade
			};
			return acc;
		},
		{} as Record<string, { id: string; grade: string }>
	);

	const prerequisites = await db
		.selectFrom('Prerequisite')
		.innerJoin(
			'Course as PrerequisiteCourse',
			'Prerequisite.prerequisite_id',
			'PrerequisiteCourse.id'
		)
		.innerJoin('Course as MainCourse', 'Prerequisite.course_id', 'MainCourse.id')
		.select([
			'Prerequisite.course_id',
			'Prerequisite.prerequisite_id',
			'PrerequisiteCourse.code as prerequisiteCode',
			'PrerequisiteCourse.name as prerequisiteName',
			'MainCourse.code as mainCourseCode'
		])
		.where(
			'Prerequisite.course_id',
			'in',
			programCourses.map((course) => course.id)
		)
		.execute();

	const prerequisiteMap = prerequisites.reduce(
		(acc, prereq) => {
			if (!acc[prereq.course_id]) {
				acc[prereq.course_id] = [];
			}
			acc[prereq.course_id]!.push({
				id: prereq.prerequisite_id,
				code: prereq.prerequisiteCode,
				name: prereq.prerequisiteName
			});
			return acc;
		},
		{} as Record<string, { id: string; code: string; name: string }[]>
	);

	const coursesWithPrerequisites = programCourses.map((course) => ({
		...course,
		prerequisites: prerequisiteMap[course.id] || []
	}));

	return {
		program: {
			id: program.id,
			name: program.name,
			requirement: programRequirement
		},
		programCourses: coursesWithPrerequisites,
		studentCourses: studentCoursesMap
	};
};

export const actions: Actions = {
	saveChanges: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const formData = await request.formData();

		try {
			const student = await db
				.selectFrom('Student')
				.where('Student.user_id', '=', userId)
				.select('id')
				.executeTakeFirst();

			if (!student) {
				return fail(404, { message: 'Student not found' });
			}

			const courseEntries = Array.from(formData.entries())
				.filter(([key, value]) => key.startsWith('courses[') && key.endsWith('].grade'))
				.map(([key, value]) => ({
					courseId: key.slice(8, -7),
					grade: value as string
				}));

			await db.transaction().execute(async (trx) => {
				// First, delete all existing entries for this student
				await trx.deleteFrom('StudentCourse').where('studentId', '=', student.id).execute();

				// Then, insert new entries
				for (const { courseId, grade } of courseEntries) {
					if (grade) {
						await trx
							.insertInto('StudentCourse')
							.values({
								id: generateId(16),
								studentId: student.id,
								courseId,
								grade
							})
							.execute();
					}
				}
			});

			return { success: true };
		} catch (err) {
			console.error('Error saving changes:', err);
			return fail(500, { message: 'Failed to save changes' });
		}
	}
};
