import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function parseEnv(text) {
	let destination;
	const actions = [];
	const convex = [];
	const errors = [];
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line) continue;
		if (line.startsWith('#')) {
			const marker = line.replace(/^#\s*/, '');
			if (marker === '@actions' || marker === '@convex') destination = marker;
			continue;
		}
		const eq = line.indexOf('=');
		if (eq < 1) {
			errors.push(`Unreadable line: ${line}`);
			continue;
		}
		const key = line.slice(0, eq).trim();
		let value = line.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (key === 'CONVEX_DEPLOYMENT') {
			errors.push('CONVEX_DEPLOYMENT belongs in packages/backend/.env.local');
			continue;
		}
		if (!destination) {
			errors.push(`${key} is above any @actions or @convex marker`);
			continue;
		}
		const row = { key, value };
		if (destination === '@actions') actions.push(row);
		else convex.push(row);
	}
	return { actions, convex, errors };
}

export function plan(parsed) {
	const lines = [];
	for (const row of parsed.actions) {
		lines.push(row.value ? `actions ${row.key}` : `skip ${row.key}`);
	}
	for (const row of parsed.convex) {
		lines.push(row.value ? `convex ${row.key}` : `skip ${row.key}`);
	}
	return lines;
}

function argValue(argv, flag) {
	const index = argv.indexOf(flag);
	return index === -1 ? undefined : argv[index + 1];
}

export function run(argv, envText) {
	const parsed = parseEnv(envText);
	if (parsed.errors.length > 0) {
		return { status: 1, output: parsed.errors.join('\n') };
	}
	const output = plan(parsed).join('\n');
	const apply = argv.includes('--apply');
	if (!apply) return { status: 0, output, actions: parsed.actions, convex: parsed.convex };

	const convexFlag = argValue(argv, '--convex');
	const convexRows = parsed.convex.filter((row) => row.value);
	if (convexRows.length > 0 && convexFlag !== 'dev' && convexFlag !== 'prod') {
		return {
			status: 1,
			output: `${output}\n--apply with @convex keys needs --convex dev or --convex prod`
		};
	}
	return {
		status: 0,
		output,
		actions: parsed.actions,
		convex: parsed.convex,
		apply: true,
		convexFlag
	};
}

function applyActions(rows) {
	const filled = rows.filter((row) => row.value);
	if (filled.length === 0) return;
	const dir = mkdtempSync(resolve(tmpdir(), 'stack-env-'));
	const file = resolve(dir, 'actions.env');
	try {
		writeFileSync(file, filled.map((row) => `${row.key}=${row.value}`).join('\n') + '\n', {
			mode: 0o600
		});
		const result = spawnSync('gh', ['secret', 'set', '-f', file], { cwd: root, stdio: 'inherit' });
		if (result.status !== 0) process.exit(result.status ?? 1);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

function applyConvex(rows, target) {
	const backend = resolve(root, 'packages/backend');
	for (const row of rows) {
		if (!row.value) continue;
		const args = ['convex', 'env', 'set', row.key, row.value];
		if (target === 'prod') args.push('--prod');
		const result = spawnSync('npx', args, { cwd: backend, stdio: 'inherit' });
		if (result.status !== 0) process.exit(result.status ?? 1);
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const file = argValue(process.argv, '--file') ?? resolve(root, '.env');
	let text;
	try {
		text = readFileSync(file, 'utf8');
	} catch {
		console.error(`No env file at ${file}`);
		process.exit(1);
	}
	const result = run(process.argv.slice(2), text);
	if (result.output) console.log(result.output);
	if (result.status !== 0) process.exit(result.status);
	if (result.apply) {
		applyActions(result.actions);
		applyConvex(result.convex, result.convexFlag);
	}
}
