<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api } from '@stack/backend/api';
	import { useConvexClient } from 'convex-svelte';
	import DeleteNoteDialog from '$lib/components/DeleteNoteDialog.svelte';
	import { getAuthState } from '$lib/state/auth.svelte';

	let { data } = $props();
	const auth = getAuthState();
	const client = useConvexClient();

	let text = $state('');
	let formError = $state('');
	let pending = $state(false);

	const notes = $derived(data.notes?.data ?? []);

	async function add(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		pending = true;
		try {
			await client.mutation(api.items.create, { text });
			text = '';
			await invalidateAll();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'The note was not saved.';
		} finally {
			pending = false;
		}
	}

	async function remove(itemId: (typeof notes)[number]['_id']) {
		formError = '';
		try {
			await client.mutation(api.items.remove, { itemId });
			await invalidateAll();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'The note was not deleted.';
		}
	}

	async function signOut() {
		await auth.signOut();
	}
</script>

<svelte:head>
	<title>Notes</title>
</svelte:head>

<header class="flex items-baseline justify-between gap-4">
	<h1 class="text-3xl font-semibold tracking-tight">Your notes</h1>
	<button type="button" class="text-sm underline" onclick={signOut}>Sign out</button>
</header>

<form class="mt-8 flex gap-2" onsubmit={add}>
	<label class="sr-only" for="note">Note</label>
	<input id="note" class="field min-w-0 flex-1" maxlength="200" placeholder="A short note" bind:value={text} />
	<button class="btn" type="submit" disabled={pending}>Add</button>
</form>
{#if formError}
	<p class="mt-3 text-sm text-danger">{formError}</p>
{/if}

{#if data.loadError}
	<p class="mt-8 text-sm text-danger">We could not load your notes. {data.loadError}</p>
{:else if notes.length === 0}
	<p class="muted mt-8">No notes yet. Add one when you are ready.</p>
{:else}
	<ul class="mt-8 divide-y divide-line border-y border-line">
		{#each notes as note (note._id)}
			<li class="flex items-start justify-between gap-4 py-3">
				<p class="text-base">{note.text}</p>
				<DeleteNoteDialog onconfirm={() => remove(note._id)} />
			</li>
		{/each}
	</ul>
{/if}
