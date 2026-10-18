import { getAuthSessionId, getAuthUserId } from '@convex-dev/auth/server';
import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { fail } from './errors';

type Ctx = QueryCtx | MutationCtx;

/** A JWT is not enough. The session row must exist, match the user, and be unexpired. */
export async function requireAccount(ctx: Ctx): Promise<Id<'users'>> {
	const userId = await getAuthUserId(ctx);
	const sessionId = await getAuthSessionId(ctx);
	const session = sessionId === null ? null : await ctx.db.get(sessionId);
	if (
		userId === null ||
		session === null ||
		session.userId !== userId ||
		session.expirationTime <= Date.now() ||
		(await ctx.db.get(userId)) === null
	) {
		fail('UNAUTHENTICATED', 'Sign in again to continue.');
	}
	return userId;
}

/** Missing and foreign notes look the same to the caller. */
export async function requireOwnedItem(ctx: Ctx, itemId: Id<'items'>): Promise<Doc<'items'>> {
	const userId = await requireAccount(ctx);
	const item = await ctx.db.get(itemId);
	if (item === null || item.userId !== userId) {
		fail('NOT_FOUND', 'Note not found.');
	}
	return item;
}
