import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { api } from '@stack/backend/api';
import { convexLoad } from 'convex-svelte/sveltekit';

export const load = async () => {
	if (browser && !localStorage.getItem('auth_token')) {
		redirect(303, '/sign-in');
	}
	try {
		return { notes: await convexLoad(api.items.list, {}), loadError: null as string | null };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'The list could not be loaded.';
		return { notes: null, loadError: message };
	}
};
