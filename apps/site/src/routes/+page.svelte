<script lang="ts">
	import { api } from '@stack/backend/api';
	import { useConvexClient } from 'convex-svelte';
	import { normalizeEmail } from '$lib/email';

	let email = $state('');
	let message = $state('');
	let pending = $state(false);

	async function join(event: SubmitEvent) {
		event.preventDefault();
		message = '';
		const normalized = normalizeEmail(email);
		if (!normalized) {
			message = 'Enter an email address.';
			return;
		}
		pending = true;
		try {
			const client = useConvexClient();
			const result = await client.mutation(api.waitlist.join, { email: normalized });
			message = result.created ? 'You are on the list.' : 'That address is already on the list.';
		} catch {
			message = 'The list did not save that address. Check the Convex URL and try again.';
		} finally {
			pending = false;
		}
	}
</script>

<svelte:head>
	<title>Stack</title>
</svelte:head>

<h1 class="max-w-[18ch] text-4xl font-semibold tracking-tight">
	A private list, and a public waitlist.
</h1>
<p class="muted mt-4 max-w-[42ch] text-lg">
	The demo is a runnable skeleton. Features get added when a real product needs them.
</p>

<form class="mt-10 flex flex-col gap-3 sm:flex-row" onsubmit={join}>
	<label class="sr-only" for="email">Email</label>
	<input
		id="email"
		class="field min-w-0 flex-1"
		type="email"
		required
		placeholder="you@example.com"
		bind:value={email}
	/>
	<button class="btn" disabled={pending}>Join the list</button>
</form>
{#if message}
	<p class="mt-4 text-sm">{message}</p>
{/if}

<p class="mt-10 text-sm">
	<a href="http://localhost:5173">Open the note list</a>
</p>
