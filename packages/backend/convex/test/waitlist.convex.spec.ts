import { convexTest } from 'convex-test';
import { expect, it } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';

const modules = import.meta.glob('../**/*.*s');

it('stores an email once', async () => {
	const t = convexTest(schema, modules);
	expect(await t.mutation(api.waitlist.join, { email: 'Ada@Example.com' })).toEqual({
		created: true
	});
	expect(await t.mutation(api.waitlist.join, { email: 'ada@example.com' })).toEqual({
		created: false
	});
	const rows = await t.run(async (ctx) => ctx.db.query('waitlist').collect());
	expect(rows.map((row) => row.email)).toEqual(['ada@example.com']);
});
