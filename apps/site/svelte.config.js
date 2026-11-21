import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		prerender: {
			// `url.origin` during prerender. Absolute URLs such as `og:image` and a
			// canonical link use it. Replace with the production domain.
			origin: 'https://example.com'
		}
	}
};

export default config;
