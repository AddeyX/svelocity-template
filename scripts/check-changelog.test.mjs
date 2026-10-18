import assert from 'node:assert/strict';
import test from 'node:test';
import { parseChangelog } from './check-changelog.mjs';

const baseline = '## [0.0.1] - 2026-10-14\n\n### Added\n\n- Initial template.\n';

test('keeps unreleased notes and the dated release', () => {
	const releases = parseChangelog(
		'## [Unreleased]\n### Fixed\n- Correct the empty state.\n' + baseline,
		'0.0.1'
	);
	assert.equal(releases[0].date, null);
	assert.deepEqual(releases[0].changes.fixed, ['Correct the empty state.']);
	assert.deepEqual(releases[1].changes.added, ['Initial template.']);
	assert.deepEqual(releases[1].changes.security, []);
});

test('rejects a changelog version that is not the package version', () => {
	assert.throws(() => parseChangelog(baseline, '0.0.2'), /must match package version/);
});

test('rejects a heading without a date on a numbered release', () => {
	assert.throws(() => parseChangelog('## [0.0.1]\n', '0.0.1'), /Invalid release date/);
});
