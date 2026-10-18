import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const mode = process.argv[2];
if (mode !== '--check' && mode !== '--write') {
	console.error('Usage: node scripts/prettier-changed.mjs --check|--write');
	process.exit(2);
}

function gitLines(args) {
	try {
		return execFileSync('git', args, { encoding: 'utf8' })
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
	} catch {
		return [];
	}
}

function isMaintained(file) {
	if (
		file === '.prettierrc' ||
		file === 'docs/ARCHITECTURE.md' ||
		file === 'docs/architecture/deploy.md'
	) {
		return true;
	}
	if (/^[^/]+\.(json|jsonc|ya?ml|md)$/.test(file)) return true;
	if (/^\.github\/.*\.ya?ml$/.test(file)) return true;
	if (/^apps\/.*\.(js|ts|svelte|css|json|jsonc)$/.test(file)) return true;
	if (/^packages\/.*\.(ts|js|mjs|css|json)$/.test(file)) return true;
	if (/^scripts\/.*\.mjs$/.test(file)) return true;
	return false;
}

function isIgnored(file) {
	return (
		file.includes('/_generated/') ||
		file.includes('/.svelte-kit/') ||
		file.includes('/.wrangler/') ||
		file.includes('/node_modules/') ||
		file.endsWith('/worker-configuration.d.ts')
	);
}

const base = process.env.PRETTIER_BASE || 'origin/main';
const files = new Set([
	...gitLines(['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`]),
	...gitLines(['diff', '--name-only', '--diff-filter=ACMR']),
	...gitLines(['diff', '--cached', '--name-only', '--diff-filter=ACMR']),
	...gitLines(['ls-files', '--others', '--exclude-standard'])
]);

const targets = [...files]
	.filter((file) => existsSync(file))
	.filter(isMaintained)
	.filter((file) => !isIgnored(file))
	.sort();

if (targets.length === 0) {
	console.log('No changed maintained files to format.');
	process.exit(0);
}

const result = spawnSync('prettier', [mode, ...targets], { stdio: 'inherit' });
process.exit(result.status ?? 1);
