import { expect, it } from 'vitest';
import { normalizeEmail } from './email';

it('lowercases a usable address and rejects a blank one', () => {
	expect(normalizeEmail(' Ada@Example.com ')).toBe('ada@example.com');
	expect(normalizeEmail('not an email')).toBeNull();
});
