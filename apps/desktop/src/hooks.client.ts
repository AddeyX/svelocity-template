import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { initConvex } from 'convex-svelte/sveltekit';

const TOKEN_KEY = 'auth_token';

const client = initConvex(PUBLIC_CONVEX_URL);
const token = localStorage.getItem(TOKEN_KEY);
if (token) {
	client.setAuth(async () => localStorage.getItem(TOKEN_KEY));
}
