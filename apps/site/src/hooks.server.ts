import type { Handle } from '@sveltejs/kit';
import { securityHeaders } from '$lib/server/securityHeaders';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	for (const [name, value] of Object.entries(
		securityHeaders({ https: event.url.protocol === 'https:' })
	)) {
		response.headers.set(name, value);
	}
	return response;
};
