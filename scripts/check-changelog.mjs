import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const categories = {
	Added: 'added',
	Changed: 'changed',
	Deprecated: 'deprecated',
	Removed: 'removed',
	Fixed: 'fixed',
	Security: 'security'
};

export function parseChangelog(markdown, version) {
	const releases = [];
	let release;
	let category;
	for (const raw of markdown.split(/\r?\n/)) {
		const line = raw.trim();
		if (line.startsWith('## ')) {
			const heading = line.match(/^## \[(Unreleased|\d+\.\d+\.\d+)\](?: - (\d{4}-\d{2}-\d{2}))?$/);
			if (!heading) throw new Error(`Invalid release heading: ${line}`);
			const [, releaseVersion, date] = heading;
			if (releaseVersion === 'Unreleased' ? date : !date)
				throw new Error(`Invalid release date: ${line}`);
			if (date && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date)
				throw new Error(`Invalid calendar date: ${date}`);
			if (releases.some((item) => item.version === releaseVersion))
				throw new Error(`Duplicate release: ${releaseVersion}`);
			release = {
				version: releaseVersion,
				date: date ?? null,
				changes: Object.fromEntries(Object.values(categories).map((key) => [key, []]))
			};
			releases.push(release);
			category = undefined;
		} else if (line.startsWith('### ') && release) {
			category = categories[line.slice(4)];
			if (!category) throw new Error(`Unknown change category: ${line}`);
		} else if (line.startsWith('- ') && release) {
			if (!category) throw new Error('Change entries require a category');
			const item = line.slice(2).trim();
			if (item && item !== '(placeholder)' && item !== 'N/A') release.changes[category].push(item);
		}
	}
	const latest = releases.find((item) => item.version !== 'Unreleased');
	if (!latest || latest.version !== version)
		throw new Error(`Latest changelog release must match package version ${version}`);
	return releases;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
	const markdown = readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8');
	const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
	const releases = parseChangelog(markdown, pkg.version);
	console.log(`Validated CHANGELOG.md v${pkg.version} (${releases.length} sections)`);
}
