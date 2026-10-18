import { expect, it } from 'vitest';
import { securityHeaders } from './securityHeaders';

it('denies framing', () => {
	expect(securityHeaders({ https: true })['X-Frame-Options']).toBe('DENY');
	expect(securityHeaders({ https: true })['X-Content-Type-Options']).toBe('nosniff');
});
