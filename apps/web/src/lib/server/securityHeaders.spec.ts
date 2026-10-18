import { expect, it } from 'vitest';
import { securityHeaders } from './securityHeaders';

it('sets frame and content-type headers, and HSTS only on https', () => {
	expect(securityHeaders({ https: false })['X-Frame-Options']).toBe('DENY');
	expect(securityHeaders({ https: false })['Strict-Transport-Security']).toBeUndefined();
	expect(securityHeaders({ https: true })['Strict-Transport-Security']).toContain(
		'max-age=31536000'
	);
});
