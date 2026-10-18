import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		expect: { requireAssertions: true },
		environment: 'edge-runtime',
		testTimeout: 15_000,
		include: ['convex/**/*.convex.spec.ts']
	}
});
