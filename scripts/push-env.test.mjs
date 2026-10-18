import assert from 'node:assert/strict';
import test from 'node:test';
import { parseEnv, plan, run } from './push-env.mjs';

const sample = `# @actions
CLOUDFLARE_API_TOKEN=token
PUBLIC_CONVEX_URL=

# @convex
SITE_URL=http://localhost:5173
`;

test('routes keys and skips empty values without printing them', () => {
	const parsed = parseEnv(sample);
	assert.deepEqual(parsed.errors, []);
	assert.equal(parsed.actions[0].key, 'CLOUDFLARE_API_TOKEN');
	const lines = plan(parsed);
	assert.deepEqual(lines, [
		'actions CLOUDFLARE_API_TOKEN',
		'skip PUBLIC_CONVEX_URL',
		'convex SITE_URL'
	]);
	assert.equal(lines.join('\n').includes('token'), false);
	assert.equal(lines.join('\n').includes('localhost'), false);
});

test('refuses CONVEX_DEPLOYMENT in the upload file', () => {
	const parsed = parseEnv('# @actions\nCONVEX_DEPLOYMENT=dev:abc\n');
	assert.match(parsed.errors.join('\n'), /CONVEX_DEPLOYMENT/);
});

test('dry run does not apply, and convex apply needs a target', () => {
	const dry = run([], sample);
	assert.equal(dry.status, 0);
	assert.equal(dry.apply, undefined);
	const missing = run(['--apply'], sample);
	assert.equal(missing.status, 1);
	assert.match(missing.output, /--convex/);
});
