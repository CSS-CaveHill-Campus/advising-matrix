import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isValidEmail(email: string): boolean {
	return /.+@.+/.test(email);
}

export function createMajorMinor(name: string): {
	major: string[];
	minor: string;
} {
	let degree: { major: string[]; minor: string } = {
		major: [],
		minor: ''
	};

	if (name && name.includes(' with ')) {
		const [major, minor] = name.split(' with ');
		degree.major = [...(major || 'None')];
		degree.minor = minor || 'None';
	}
	if (name && name.includes(' and ')) {
		const [major1, major2] = name.split(' and ');
		degree.major = [major1 || 'None', major2 || 'None'];
		degree.major = degree.major.filter((m) => m !== 'None');
		degree.minor = 'None';
	} else {
		degree.major = [name || 'None'];
		degree.minor = 'None';
	}

	return degree;
}
