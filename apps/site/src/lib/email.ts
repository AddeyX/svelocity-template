const EMAIL_MAX = 254;

export function normalizeEmail(value: string): string | null {
	const email = value.trim().toLowerCase();
	if (email.length < 3 || email.length > EMAIL_MAX) return null;
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
	return email;
}
