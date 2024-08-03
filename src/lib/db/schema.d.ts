import type { ColumnType } from 'kysely';
export type Generated<T> =
	T extends ColumnType<infer S, infer I, infer U>
		? ColumnType<S, I | undefined, U>
		: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserRole = {
	STUDENT: 'STUDENT',
	ADVISOR: 'ADVISOR',
	ADMIN: 'ADMIN'
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const RequirementType = {
	CREDITS: 'CREDITS',
	POOL: 'POOL'
} as const;
export type RequirementType = (typeof RequirementType)[keyof typeof RequirementType];
export type Advisor = {
	id: string;
	user_id: string;
};
export type Course = {
	id: string;
	code: string;
	name: string;
	level: number;
	credits: number;
	departmentId: string;
};
export type CoursePrerequisite = {
	id: string;
	courseId: string;
	prerequisiteId: string;
};
export type Degree = {
	id: string;
	name: string;
	student_id: string;
};
export type Department = {
	id: string;
	name: string;
};
export type Prerequisite = {
	id: string;
	course_id: string;
	prerequisite_id: string;
};
export type Program = {
	id: string;
	name: string;
};
export type ProgramRequirement = {
	id: string;
	programId: string;
	type: RequirementType;
	credits: number;
	details: unknown;
};
export type Session = {
	id: string;
	expires_at: Timestamp;
	user_id: string;
};
export type Student = {
	id: string;
	user_id: string;
	advisor_id: string;
	invite_token: string | null;
	invite_expires: Timestamp | null;
	majorId: string | null;
	program_id: string | null;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type StudentCourse = {
	id: string;
	studentId: string;
	courseId: string;
	grade: string;
};
export type User = {
	id: string;
	name: string | null;
	email: string;
	password: string;
	role: UserRole;
	created_at: Generated<Timestamp>;
	updated_at: Timestamp;
};
export type DB = {
	Advisor: Advisor;
	Course: Course;
	CoursePrerequisite: CoursePrerequisite;
	Degree: Degree;
	Department: Department;
	Prerequisite: Prerequisite;
	Program: Program;
	ProgramRequirement: ProgramRequirement;
	Session: Session;
	Student: Student;
	StudentCourse: StudentCourse;
	User: User;
};
