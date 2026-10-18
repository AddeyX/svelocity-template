import { browser } from '$app/environment';
import { api } from '@stack/backend/api';
import { convexLoad } from 'convex-svelte/sveltekit';

export const load = async () => {
	if (browser && !localStorage.getItem('auth_token')) {
		return { notes: null, loadError: null };
	}
	try {
		return { notes: await convexLoad(api.items.list, {}), loadError: null as string | null };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'The list could not be loaded.';
		return { notes: null, loadError: message };
	}
};
