<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupAuth, setupConvex, useConvexClient } from 'convex-svelte';
	import { createAuthState, setAuthState } from '$lib/state/auth.svelte';
	import './layout.css';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
	const client = useConvexClient();
	const auth = setAuthState(createAuthState(client));
	setupAuth(() => ({
		isLoading: auth.isLoading,
		isAuthenticated: auth.isAuthenticated,
		fetchAccessToken: auth.fetchAccessToken
	}));

	$effect(() => {
		if (auth.isLoading) return;
		const id = page.route.id;
		if (!id) return;
		const authRoute = id === '/sign-in' || id === '/sign-up';
		if (!auth.isAuthenticated && !authRoute) void goto('#/sign-in');
		else if (auth.isAuthenticated && authRoute) void goto('#/');
	});
</script>

<div class="arrive mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-10">
	{@render children()}
</div>
