#!/usr/bin/env node
/**
 * Toggle files.exclude and search.exclude booleans in .vscode/settings.json.
 * true -> false, false -> true. Preserves JSONC comments and formatting.
 *
 * Usage:
 *   node scripts/toggle-hidden-files.mjs [path/to/settings.json]
 *   pnpm toggle:hidden
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultSettingsPath = path.join(__dirname, '..', '.vscode', 'settings.json');
const settingsPath = path.resolve(process.argv[2] ?? defaultSettingsPath);

const EXCLUDE_KEYS = ['files.exclude', 'search.exclude'];

function countNetBraces(line) {
	return (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length;
}

function toggleLineBooleans(line) {
	return line
		.replace(/: true\b/g, ': __FLIP_TRUE__')
		.replace(/: false\b/g, ': true')
		.replace(/: __FLIP_TRUE__/g, ': false');
}

function toggleExcludeSections(content) {
	const lines = content.split('\n');
	let activeKey = null;
	let braceDepth = 0;
	let toggled = 0;
	const touchedKeys = new Set();

	const result = lines.map((line) => {
		if (!activeKey) {
			for (const key of EXCLUDE_KEYS) {
				if (line.includes(`"${key}"`)) {
					activeKey = key;
					braceDepth = countNetBraces(line);
					touchedKeys.add(key);
					return line;
				}
			}
			return line;
		}

		const before = line;
		const flipped = toggleLineBooleans(line);
		if (flipped !== before) {
			toggled += (before.match(/: (true|false)\b/g) ?? []).length;
		}

		braceDepth += countNetBraces(line);
		if (braceDepth <= 0) {
			activeKey = null;
			braceDepth = 0;
		}

		return flipped;
	});

	return {
		content: result.join('\n'),
		toggled,
		keys: [...touchedKeys]
	};
}

if (!fs.existsSync(settingsPath)) {
	console.error(`Settings file not found: ${settingsPath}`);
	process.exit(1);
}

const original = fs.readFileSync(settingsPath, 'utf8');
const { content, toggled, keys } = toggleExcludeSections(original);

if (content === original) {
	console.log(`No changes in ${settingsPath}`);
	process.exit(0);
}

fs.writeFileSync(settingsPath, content, 'utf8');

console.log(`Toggled ${toggled} exclude entries in ${settingsPath}`);
console.log(`Sections: ${keys.join(', ')}`);
console.log('Reload the VS Code window if the explorer does not update immediately.');
