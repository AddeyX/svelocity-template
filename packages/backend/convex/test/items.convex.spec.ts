import { convexTest } from 'convex-test';
import { ConvexError } from 'convex/values';
import { describe, expect, it } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';

const modules = import.meta.glob('../**/*.*s');

type Test = ReturnType<typeof convexTest>;

async function signedIn(t: Test, email: string, expiresIn = 3_600_000) {
	const { userId, sessionId } = await t.run(async (ctx) => {
		const userId = await ctx.db.insert('users', { email });
		const sessionId = await ctx.db.insert('authSessions', {
			userId,
			expirationTime: Date.now() + expiresIn
		});
		return { userId, sessionId };
	});
	return { userId, sessionId, as: t.withIdentity({ subject: `${userId}|${sessionId}` }) };
}

function codeOf(error: unknown) {
	expect(error).toBeInstanceOf(ConvexError);
	return (error as ConvexError<{ code: string }>).data.code;
}

describe('items', () => {
	it('rejects a list without a session', async () => {
		const t = convexTest(schema, modules);
		await expect(t.query(api.items.list, {})).rejects.toThrow(ConvexError);
	});

	it('hides a note from another account', async () => {
		const t = convexTest(schema, modules);
		const owner = await signedIn(t, 'one@example.test');
		const other = await signedIn(t, 'two@example.test');
		const itemId = await owner.as.mutation(api.items.create, { text: 'Mine' });
		await expect(other.as.mutation(api.items.remove, { itemId })).rejects.toSatisfy(
			(error: unknown) => codeOf(error) === 'NOT_FOUND'
		);
		expect(await owner.as.query(api.items.list, {})).toHaveLength(1);
	});

	it('rejects a removed session', async () => {
		const t = convexTest(schema, modules);
		const owner = await signedIn(t, 'one@example.test');
		await t.run(async (ctx) => {
			await ctx.db.delete(owner.sessionId);
		});
		await expect(owner.as.query(api.items.list, {})).rejects.toSatisfy(
			(error: unknown) => codeOf(error) === 'UNAUTHENTICATED'
		);
	});

	it('rejects a note longer than 200 characters', async () => {
		const t = convexTest(schema, modules);
		const owner = await signedIn(t, 'one@example.test');
		await expect(owner.as.mutation(api.items.create, { text: 'x'.repeat(201) })).rejects.toSatisfy(
			(error: unknown) => codeOf(error) === 'INVALID'
		);
	});
});
