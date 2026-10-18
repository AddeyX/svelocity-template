import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	...authTables,
	items: defineTable({
		userId: v.id('users'),
		text: v.string(),
		createdAt: v.number()
	}).index('by_user', ['userId']),
	waitlist: defineTable({
		email: v.string()
	}).index('by_email', ['email'])
});
