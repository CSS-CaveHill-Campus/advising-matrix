import type { CourseWithRequirement, Grade } from '$lib/types';
import { writable } from 'svelte/store';
export const programCoursesStore = writable<CourseWithRequirement[]>([]);
