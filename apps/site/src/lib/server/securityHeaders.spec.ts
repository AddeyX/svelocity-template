import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { securityHeaders } from './securityHeaders';

it('denies framing', () => {
	expect(securityHeaders({ https: true })['X-Frame-Options']).toBe('DENY');
	expect(securityHeaders({ https: true })['X-Content-Type-Options']).toBe('nosniff');
});

it('sends the same headers on prerendered pages', () => {
	const file = readFileSync(new URL('../../../_headers', import.meta.url), 'utf8');
	const lines = file.split('\n').map((line) => line.trim());
	for (const [name, value] of Object.entries(securityHeaders({ https: true }))) {
		expect(lines).toContain(`${name}: ${value}`);
	}
});
