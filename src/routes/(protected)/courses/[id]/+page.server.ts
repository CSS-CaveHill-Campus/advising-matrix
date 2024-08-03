import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { Course } from '$lib/db/schema';

type CourseWithPrerequisites = Course & { prerequisites: CourseWithPrerequisites[] };

async function getCourseWithPrerequisites(courseId: string): Promise<CourseWithPrerequisites> {
	const course = await db
		.selectFrom('Course')
		.selectAll()
		.where('id', '=', courseId)
		.executeTakeFirst();

	if (!course) {
		error(404, 'Course not found');
	}

	const prerequisites = await db
		.selectFrom('CoursePrerequisite')
		.innerJoin('Course', 'Course.id', 'CoursePrerequisite.prerequisiteId')
		.select(['Course.id', 'Course.code', 'Course.name'])
		.where('CoursePrerequisite.courseId', '=', courseId)
		.execute();

	const fullPrerequisites = await Promise.all(
		prerequisites.map((prereq) => getCourseWithPrerequisites(prereq.id))
	);

	return {
		...course,
		prerequisites: fullPrerequisites
	};
}

export const load: PageServerLoad = async ({ params }) => {
	const course = await getCourseWithPrerequisites(params.id);

	return { course };
};
