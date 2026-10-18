import { expect, it } from 'vitest';
import { isNative, platform } from './native';

it('reports a web platform outside a native shell', () => {
	expect(platform()).toBe('web');
	expect(isNative()).toBe(false);
});
