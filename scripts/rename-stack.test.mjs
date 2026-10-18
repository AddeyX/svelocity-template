import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { renameText, renameTree } from './rename-stack.mjs';

test('replaces scope, workers, and title, and leaves the word stack', () => {
	const next = renameText(
		'@stack/backend stack-web stack-site app.stack.desktop app.stack.mobile stackDesktop "name": "stack"\nname: Stack\nthe stack stays\n',
		'acme',
		'Acme'
	);
	assert.match(next, /@acme\/backend/);
	assert.match(next, /acme-web/);
	assert.match(next, /acme-site/);
	assert.match(next, /"name": "acme"/);
	assert.match(next, /app.acme.desktop/);
	assert.match(next, /app.acme.mobile/);
	assert.match(next, /acmeDesktop/);
	assert.match(next, /name: Acme/);
	assert.match(next, /the stack stays/);
	assert.equal(next.includes('@stack'), false);
	assert.equal(next.includes('stack-web'), false);
});

test('writes a fixture tree and skips node_modules', () => {
	const root = mkdtempSync(join(tmpdir(), 'stack-rename-'));
	try {
		writeFileSync(join(root, 'package.json'), '{ "name": "stack", "dep": "@stack/backend" }\n');
		writeFileSync(join(root, 'note.md'), 'the stack\n');
		const changed = renameTree(root, 'acme', 'Acme');
		assert.deepEqual(changed, ['package.json']);
		assert.match(readFileSync(join(root, 'package.json'), 'utf8'), /@acme\/backend/);
		assert.equal(readFileSync(join(root, 'note.md'), 'utf8'), 'the stack\n');
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
