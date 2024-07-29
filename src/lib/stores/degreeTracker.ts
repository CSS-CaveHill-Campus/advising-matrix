import type { CourseRequirement, CourseWithRequirement } from '$lib/types';
import { writable } from 'svelte/store';
export const poolCourses = writable<CourseWithRequirement[]>([]);
