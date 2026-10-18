import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		// Electron loads one index.html. Routes live in the hash (#/notes), not on a server.
		router: { type: 'hash' }
	}
};

export default config;
