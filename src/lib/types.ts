import type { Course, ProgramRequirement as DBProgramRequirement } from './db/schema';

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

export type CourseRequirement = {
	courses: Course['id'][]; // Course IDs
};

export type PoolRequirement = {
	levelPool: ('I' | 'II' | 'III')[];
	facultyPool: string[] | 'any';
};

export type RequirementDetails = CourseRequirement | PoolRequirement;

export type ProgramRequirement = Omit<DBProgramRequirement, 'details'> & {
	details: RequirementDetails;
};
