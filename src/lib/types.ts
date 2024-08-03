import type {
	Course,
	ProgramRequirement as DBProgramRequirement,
	Program as DBProgram,
	StudentCourse
} from './db/schema';

export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'F1' | 'F2' | 'F3' | null;

export const gradePoints: Record<NonNullable<Grade>, number> = {
	'A+': 4.3,
	A: 4.0,
	'A-': 3.7,
	'B+': 3.3,
	B: 3.0,
	'B-': 2.7,
	'C+': 2.3,
	C: 2.0,
	F1: 1.7,
	F2: 1.3,
	F3: 0.0
};

// export type RequirementGroup =
// 	| {
// 			type: 'CREDITS';
// 			credits: number;
// 			courses: Course['id'][];
// 	  }
// 	| {
// 			type: 'POOL';
// 			credits: number;
// 			levelPool: ('I' | 'II' | 'III')[];
// 			facultyPool: string[] | 'any';
// 	  };

type Omittable<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CourseRequirement = {
	courses: Course['id'][]; // Course IDs
};

export type PoolRequirement = {
	levelPool: ('I' | 'II' | 'III')[];
	facultyPool: string[] | 'any' | 'anyother';
};

export type RequirementDetails = CourseRequirement | PoolRequirement;

export type ProgramRequirement = Omit<DBProgramRequirement, 'details'> & {
	details: RequirementDetails;
};

export type CoursePrerequisite = Pick<Course, 'id' | 'code' | 'name'> | Course;

export type CourseWithPrerequisites = Course & {
	prerequisites: readonly CoursePrerequisite[];
};

export type CourseWithRequirement = CourseWithPrerequisites & {
	requirementId: string | null;
};

export type Program = DBProgram & {
	requirements: ProgramRequirement[];
};

export type StudentGrade = Omittable<StudentCourse, 'id' | 'studentId' | 'courseId'> & {
	course: Omit<Course, 'departmentId'>;
	grade: Grade;
};
