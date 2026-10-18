import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { fail } from './lib/errors';
import { requireAccount, requireOwnedItem } from './lib/ownership';

const PAGE = 50;
const TEXT_MAX = 200;

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAccount(ctx);
		const rows = await ctx.db
			.query('items')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.take(PAGE);
		return rows.sort((a, b) => b.createdAt - a.createdAt);
	}
});

export const create = mutation({
	args: { text: v.string() },
	handler: async (ctx, { text }) => {
		const userId = await requireAccount(ctx);
		const trimmed = text.trim();
		if (trimmed.length < 1 || trimmed.length > TEXT_MAX) {
			fail('INVALID', `A note must be 1–${TEXT_MAX} characters.`);
		}
		return await ctx.db.insert('items', { userId, text: trimmed, createdAt: Date.now() });
	}
});

export const remove = mutation({
	args: { itemId: v.id('items') },
	handler: async (ctx, { itemId }) => {
		const item = await requireOwnedItem(ctx, itemId);
		await ctx.db.delete(item._id);
		return { changed: true as const };
	}
});
