import { expect, it } from 'vitest';
import { isSafeExternalUrl } from './url-safety';

it('allows http and https and rejects everything else', () => {
	expect(isSafeExternalUrl('https://stack.example/notes')).toBe(true);
	expect(isSafeExternalUrl('http://localhost:5173')).toBe(true);
	expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false);
	expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
	expect(isSafeExternalUrl('not a url')).toBe(false);
});
