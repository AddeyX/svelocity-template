#!/usr/bin/env node
/**
 * Compare local branches with GitHub pull requests and delete the ones you pick.
 * Remote branches are left alone.
 *
 *   pnpm branches:prune
 *   pnpm branches:prune -- --report
 */

import { execFile } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

class CliError extends Error {}

function exec(cmd, args, options = {}) {
	return new Promise((resolve, reject) => {
		execFile(
			cmd,
			args,
			{
				encoding: 'utf8',
				maxBuffer: 10 * 1024 * 1024,
				env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
				...options
			},
			(error, stdout, stderr) => {
				if (error) {
					error.stdout = stdout;
					error.stderr = stderr;
					reject(error);
					return;
				}
				resolve({ stdout: String(stdout).trim(), stderr: String(stderr).trim() });
			}
		);
	});
}

async function run(cmd, args, options) {
	const { stdout } = await exec(cmd, args, options);
	return stdout;
}

function parseArgs(argv) {
	const flags = new Set(['--report', '--no-fetch', '--help', '-h']);
	const unknown = argv.filter((arg) => !flags.has(arg));
	if (unknown.length > 0) {
		throw new CliError(`Unknown option ${unknown[0]}. Run with --help.`);
	}
	return {
		reportOnly: argv.includes('--report'),
		fetch: !argv.includes('--no-fetch'),
		help: argv.includes('--help') || argv.includes('-h')
	};
}

function helpText() {
	return `Scan local branches, match them to GitHub pull requests, and delete the ones you choose.

Usage
  pnpm branches:prune
  pnpm branches:prune -- --report
  pnpm branches:prune -- --no-fetch

The default run fetches origin, prints every local branch, and asks which
ones to delete. Deletion removes the local branch only.

Choices at the prompt
  merged     every branch whose pull request merged, or whose commits are already in the default branch
  1 3 5      those rows
  1-4        a range
  q          cancel

Branches you have checked out, and the default branch, are listed but not offered.`;
}

async function repoRoot() {
	try {
		return await run('git', ['rev-parse', '--show-toplevel']);
	} catch {
		throw new CliError('Run this from inside the git repository.');
	}
}

async function assertGh(cwd) {
	try {
		await exec('gh', ['auth', 'status'], { cwd });
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new CliError('GitHub CLI (gh) is not installed.');
		}
		throw new CliError('GitHub CLI is not authenticated. Run `gh auth login`, then try again.');
	}
}

async function defaultBase(cwd) {
	try {
		const ref = await run('git', ['rev-parse', '--abbrev-ref', 'origin/HEAD'], { cwd });
		if (ref && ref !== 'origin/HEAD') return ref;
	} catch {
		// origin/HEAD is set below from the GitHub default branch.
	}

	let name = 'main';
	try {
		const fromGh = await run(
			'gh',
			['repo', 'view', '--json', 'defaultBranchRef', '--jq', '.defaultBranchRef.name'],
			{ cwd }
		);
		if (fromGh) name = fromGh;
	} catch {
		// Fall back to main, then whatever local branch exists.
	}

	for (const candidate of [`origin/${name}`, name]) {
		try {
			await exec('git', ['rev-parse', '--verify', '--quiet', candidate], { cwd });
			return candidate;
		} catch {
			// Try the next candidate.
		}
	}
	throw new CliError(`Could not find the default branch (${name}).`);
}

function samePath(left, right) {
	try {
		return realpathSync(left) === realpathSync(right);
	} catch {
		return left === right;
	}
}

function checkedOutBranches(porcelain) {
	const map = new Map();
	let path = '';
	for (const line of porcelain.split('\n')) {
		if (line.startsWith('worktree ')) path = line.slice('worktree '.length);
		if (line.startsWith('branch ')) {
			const name = line.slice('branch '.length).replace(/^refs\/heads\//, '');
			map.set(name, path);
		}
	}
	return map;
}

function pickPullRequest(pulls) {
	const rank = { MERGED: 0, OPEN: 1, CLOSED: 2 };
	return [...pulls].sort((a, b) => {
		const byState = (rank[a.state] ?? 9) - (rank[b.state] ?? 9);
		if (byState !== 0) return byState;
		return String(b.mergedAt ?? '').localeCompare(String(a.mergedAt ?? ''));
	})[0];
}

async function pullRequestFor(branch, cwd) {
	const stdout = await run(
		'gh',
		[
			'pr',
			'list',
			'--head',
			branch,
			'--state',
			'all',
			'--limit',
			'20',
			'--json',
			'number,title,state,mergedAt,url,headRefOid'
		],
		{ cwd }
	);
	const pulls = JSON.parse(stdout);
	return pulls.length > 0 ? pickPullRequest(pulls) : null;
}

async function exitCode(cmd, args, cwd) {
	try {
		await exec(cmd, args, { cwd });
		return 0;
	} catch (error) {
		if (typeof error.code === 'number') return error.code;
		throw error;
	}
}

async function countCommits(range, cwd) {
	try {
		const stdout = await run('git', ['rev-list', '--count', range], { cwd });
		return Number(stdout);
	} catch {
		return null;
	}
}

async function classify(branch, base, cwd) {
	const ahead = await countCommits(`${base}..${branch.name}`, cwd);
	const contained = ahead === 0;
	const pr = branch.pr;
	let commitsAfterPr = null;
	if (pr?.headRefOid) {
		commitsAfterPr = await countCommits(`${pr.headRefOid}..${branch.name}`, cwd);
	}

	if (pr?.state === 'MERGED' && (commitsAfterPr === 0 || contained)) {
		return { kind: 'merged-pr', ahead, commitsAfterPr, safe: true };
	}
	if (contained) {
		return { kind: 'in-main', ahead, commitsAfterPr, safe: true };
	}
	if (pr?.state === 'MERGED') {
		return { kind: 'merged-pr-plus', ahead, commitsAfterPr, safe: false };
	}
	if (pr?.state === 'OPEN') {
		return { kind: 'open-pr', ahead, commitsAfterPr, safe: false };
	}
	if (pr?.state === 'CLOSED') {
		return { kind: 'closed-pr', ahead, commitsAfterPr, safe: false };
	}
	return { kind: 'unmerged', ahead, commitsAfterPr, safe: false };
}

function statusLabel(row) {
	const ahead = row.ahead == null ? '?' : String(row.ahead);
	switch (row.kind) {
		case 'merged-pr':
			return 'merged PR';
		case 'in-main':
			return 'in default branch';
		case 'merged-pr-plus':
			return row.commitsAfterPr == null
				? 'merged PR, tip not compared'
				: `merged PR + ${row.commitsAfterPr} newer`;
		case 'open-pr':
			return `open PR, ${ahead} not in main`;
		case 'closed-pr':
			return `closed PR, ${ahead} not in main`;
		default:
			return `${ahead} not in main`;
	}
}

function prLabel(pr) {
	if (!pr) return '—';
	const state = pr.state === 'MERGED' ? 'merged' : pr.state === 'OPEN' ? 'open' : 'closed';
	return `#${pr.number} ${state}`;
}

function pad(value, width) {
	const text = String(value);
	return text.length >= width ? text : text + ' '.repeat(width - text.length);
}

function clip(value, width) {
	const text = String(value).replace(/\s+/g, ' ');
	if (text.length <= width) return text;
	return text.slice(0, Math.max(0, width - 1)) + '…';
}

function render(rows, baseName) {
	const shown = rows.filter((row) => row.offered || row.kept);
	const branchWidth = Math.min(42, Math.max(6, ...shown.map((row) => row.name.length)));
	const prWidth = Math.max(12, ...shown.map((row) => prLabel(row.pr).length));
	const statusWidth = Math.max(10, ...shown.map((row) => statusLabel(row).length));
	const lines = [];
	const header = `  ${pad('#', 3)}  ${pad('Branch', branchWidth)}  ${pad('Pull request', prWidth)}  ${pad('Status', statusWidth)}  Last commit`;
	lines.push(header);
	for (const row of shown) {
		const number = row.offered ? String(row.index) : '';
		const when = pad(clip(row.when, 14), 14);
		lines.push(
			`  ${pad(number, 3)}  ${pad(clip(row.name, branchWidth), branchWidth)}  ${pad(prLabel(row.pr), prWidth)}  ${pad(statusLabel(row), statusWidth)}  ${when}  ${clip(row.subject, 48)}`
		);
		if (row.kept) lines.push(`       ${row.kept}`);
	}
	const offered = rows.filter((row) => row.offered);
	const safe = offered.filter((row) => row.safe).map((row) => row.index);
	lines.push('');
	lines.push(
		`${offered.length} can be deleted locally. \`merged\` selects ${safe.length > 0 ? safe.join(', ') : 'nothing'} (merged PRs and branches already in ${baseName}).`
	);
	return lines.join('\n');
}

function parseSelection(text, offered) {
	const value = text.trim().toLowerCase();
	if (value === '' || value === 'q' || value === 'quit' || value === 'cancel') return [];
	if (value === 'merged' || value === 'all-merged') {
		return offered.filter((row) => row.safe);
	}

	const byIndex = new Map(offered.map((row) => [row.index, row]));
	const picked = new Map();
	for (const part of value.split(/[\s,]+/).filter(Boolean)) {
		const range = /^(\d+)-(\d+)$/.exec(part);
		let start;
		let end;
		if (range) {
			start = Number(range[1]);
			end = Number(range[2]);
			if (start > end) [start, end] = [end, start];
		} else if (/^\d+$/.test(part)) {
			start = end = Number(part);
		} else {
			throw new CliError(`Unknown choice "${part}". Use numbers, a range like 1-4, merged, or q.`);
		}
		for (let index = start; index <= end; index += 1) {
			const row = byIndex.get(index);
			if (!row) throw new CliError(`No branch numbered ${index}.`);
			picked.set(index, row);
		}
	}
	return [...picked.values()].sort((a, b) => a.index - b.index);
}

async function ask(rl, question) {
	const answer = await rl.question(question);
	return answer.trim();
}

async function confirmDelete(rl, selected) {
	const unsafe = selected.filter((row) => !row.safe);
	console.log('');
	console.log('Delete these local branches:');
	for (const row of selected) {
		const warning = row.safe ? '' : '  — still has work that is not in the default branch';
		console.log(`  ${row.name}${warning}`);
	}
	console.log('Remote branches stay.');

	if (unsafe.length > 0) {
		const answer = await ask(
			rl,
			'Type delete-unmerged to delete all of them, yes to delete only merged ones, or press Enter to cancel: '
		);
		if (answer === 'delete-unmerged') return selected;
		if (answer.toLowerCase() === 'yes') return selected.filter((row) => row.safe);
		return [];
	}

	const answer = await ask(rl, 'Type yes to delete them, or press Enter to cancel: ');
	return answer.toLowerCase() === 'yes' ? selected : [];
}

async function deleteBranch(name, cwd) {
	await exec('git', ['branch', '-D', '--', name], { cwd });
}

function sortRows(rows) {
	const rank = {
		'merged-pr': 0,
		'in-main': 1,
		'merged-pr-plus': 2,
		'open-pr': 3,
		'closed-pr': 4,
		unmerged: 5
	};
	return [...rows].sort((a, b) => {
		const byKind = (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9);
		if (byKind !== 0) return byKind;
		return a.name.localeCompare(b.name);
	});
}

async function loadBranches(cwd, base, here) {
	const [refText, worktreeText] = await Promise.all([
		run(
			'git',
			[
				'for-each-ref',
				'refs/heads',
				'--format=%(refname:short)%00%(committerdate:relative)%00%(subject)'
			],
			{ cwd }
		),
		run('git', ['worktree', 'list', '--porcelain'], { cwd })
	]);
	const worktrees = checkedOutBranches(worktreeText);
	const baseName = base.replace(/^origin\//, '');
	const refs = refText
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [name, when, subject] = line.split('\0');
			return { name, when, subject };
		});

	const rows = [];
	for (const [offset, ref] of refs.entries()) {
		process.stderr.write(`\rChecking pull requests… ${offset + 1}/${refs.length}`);
		let pr = null;
		try {
			pr = await pullRequestFor(ref.name, cwd);
		} catch (error) {
			const detail = (error.stderr || error.message || '').trim();
			throw new CliError(`Could not look up pull requests for ${ref.name}. ${detail}`);
		}

		const checkout = worktrees.get(ref.name);
		let kept = null;
		if (ref.name === baseName) kept = 'kept — default branch';
		else if (checkout && samePath(checkout, here)) kept = 'kept — checked out here';
		else if (checkout) kept = `kept — checked out at ${checkout}`;

		const classified = await classify({ ...ref, pr }, base, cwd);
		rows.push({ ...ref, pr, ...classified, kept, offered: kept === null });
	}
	process.stderr.write(process.stderr.isTTY ? '\r\x1b[K' : '\n');

	const ordered = [
		...sortRows(rows.filter((row) => row.offered)),
		...rows.filter((row) => row.kept).sort((a, b) => a.name.localeCompare(b.name))
	];
	let index = 1;
	for (const row of ordered) {
		if (row.offered) {
			row.index = index;
			index += 1;
		}
	}
	return ordered;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(helpText());
		return;
	}

	const cwd = await repoRoot();
	await assertGh(cwd);

	if (options.fetch) {
		process.stderr.write('Fetching origin…\n');
		try {
			await exec('git', ['fetch', 'origin'], { cwd });
		} catch (error) {
			const detail = (error.stderr || error.message || '').trim();
			process.stderr.write(
				`Fetch failed (${detail}). Comparing against the refs already on disk.\n`
			);
		}
	}

	const base = await defaultBase(cwd);
	const baseName = base.replace(/^origin\//, '');
	const here = await run('git', ['rev-parse', '--show-toplevel'], { cwd });
	const rows = await loadBranches(cwd, base, here);

	console.log(`Local branches compared with ${base}`);
	console.log(render(rows, baseName));

	const offered = rows.filter((row) => row.offered);
	if (options.reportOnly || !input.isTTY || !output.isTTY) {
		if (!options.reportOnly) {
			console.log('\nRe-run in a terminal to choose branches. Nothing was deleted.');
		}
		return;
	}
	if (offered.length === 0) {
		console.log('\nNo local branches can be deleted.');
		return;
	}

	const rl = createInterface({ input, output });
	try {
		console.log('\nChoose branches to delete locally (merged, numbers, a range, or q).');
		const answer = await ask(rl, '> ');
		const selected = parseSelection(answer, offered);
		if (selected.length === 0) {
			console.log('Nothing deleted.');
			return;
		}
		const confirmed = await confirmDelete(rl, selected);
		if (confirmed.length === 0) {
			console.log('Nothing deleted.');
			return;
		}
		for (const row of confirmed) {
			await deleteBranch(row.name, cwd);
			console.log(`Deleted local branch ${row.name}`);
		}
	} finally {
		rl.close();
	}
}

main().catch((error) => {
	if (error instanceof CliError) {
		console.error(error.message);
	} else {
		console.error(error.stderr?.trim?.() || error.message);
	}
	process.exitCode = 1;
});
