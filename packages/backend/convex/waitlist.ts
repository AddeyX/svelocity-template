import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { fail } from './lib/errors';

const EMAIL_MAX = 254;

export function normalizeEmail(value: string): string {
	const email = value.trim().toLowerCase();
	if (email.length < 3 || email.length > EMAIL_MAX || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		fail('INVALID', 'Enter an email address.');
	}
	return email;
}

/** Named public exception: this mutation does not require an account. */
export const join = mutation({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const normalized = normalizeEmail(email);
		const existing = await ctx.db
			.query('waitlist')
			.withIndex('by_email', (q) => q.eq('email', normalized))
			.unique();
		if (existing) return { created: false as const };
		await ctx.db.insert('waitlist', { email: normalized });
		return { created: true as const };
	}
});
