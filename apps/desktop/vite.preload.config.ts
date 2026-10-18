import { defineConfig } from 'vite';

/** Sandboxed preloads must be CommonJS. */
export default defineConfig({
	build: {
		target: 'node22',
		outDir: 'dist-electron',
		emptyOutDir: false,
		sourcemap: true,
		lib: {
			entry: 'electron/preload.ts',
			formats: ['cjs'],
			fileName: () => 'preload.cjs'
		},
		rollupOptions: {
			external: ['electron']
		}
	}
});
