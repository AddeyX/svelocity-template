<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import './layout.css';

	let { children } = $props();
	if (browser) setupConvex(PUBLIC_CONVEX_URL);
</script>

<div class="arrive mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-16">
	{@render children()}
</div>
