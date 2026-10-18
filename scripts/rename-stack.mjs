import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['node_modules', '.git', '.svelte-kit', '.wrangler', 'dist', 'build']);

export function renameText(text, name, title) {
	return text
		.replaceAll('@stack/', `@${name}/`)
		.replaceAll('"name": "stack"', `"name": "${name}"`)
		.replaceAll('stack-web', `${name}-web`)
		.replaceAll('stack-site', `${name}-site`)
		.replaceAll('app.stack.desktop', `app.${name}.desktop`)
		.replaceAll('app.stack.mobile', `app.${name}.mobile`)
		.replaceAll('stackDesktop', `${name}Desktop`)
		.replaceAll('name: Stack', `name: ${title}`);
}

function argValue(argv, flag) {
	const index = argv.indexOf(flag);
	return index === -1 ? undefined : argv[index + 1];
}

function filesUnder(dir, acc = []) {
	for (const entry of readdirSync(dir)) {
		if (skip.has(entry)) continue;
		const path = join(dir, entry);
		const stat = statSync(path);
		if (stat.isDirectory()) filesUnder(path, acc);
		else if (stat.isFile()) acc.push(path);
	}
	return acc;
}

export function renameTree(root, name, title) {
	const changed = [];
	for (const path of filesUnder(root)) {
		let text;
		try {
			text = readFileSync(path, 'utf8');
		} catch {
			continue;
		}
		if (text.includes('\u0000')) continue;
		const next = renameText(text, name, title);
		if (next !== text) {
			writeFileSync(path, next);
			changed.push(relative(root, path));
		}
	}
	return changed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const name = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
	if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
		console.error('Usage: pnpm rename -- <name> [--title Title] ');
		process.exit(1);
	}
	const title = argValue(process.argv, '--title') ?? name.charAt(0).toUpperCase() + name.slice(1);
	const root = resolve(argValue(process.argv, '--root') ?? defaultRoot);
	const changed = renameTree(root, name, title);
	if (changed.length === 0) {
		console.log('No @stack identifiers left to rename.');
		process.exit(0);
	}
	console.log(changed.join('\n'));
	console.log('Run pnpm install so the lockfile matches the new scope.');
}
