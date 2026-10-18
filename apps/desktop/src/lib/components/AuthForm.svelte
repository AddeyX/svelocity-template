<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { getAuthState } from '$lib/state/auth.svelte';

	let { flow, signInHref = '/sign-in', signUpHref = '/sign-up' }: {
		flow: 'signIn' | 'signUp';
		signInHref?: string;
		signUpHref?: string;
	} = $props();
	const auth = getAuthState();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let pending = $state(false);
	let errorOpen = $state(false);

	const title = $derived(flow === 'signUp' ? 'Create an account' : 'Sign in');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		pending = true;
		const result = await auth.signIn({ email, password, flow });
		pending = false;
		if (result.error) {
			error = result.error;
			errorOpen = true;
		}
	}
</script>

<h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
<p class="muted mt-2">
	{flow === 'signUp' ? 'Password sign-up for this demo.' : 'Use the email and password you created.'}
</p>

<form class="mt-8 grid gap-4" onsubmit={submit}>
	<label class="grid gap-1 text-sm">
		Email
		<input class="field" type="email" autocomplete="email" required bind:value={email} />
	</label>
	<label class="grid gap-1 text-sm">
		Password
		<input
			class="field"
			type="password"
			autocomplete={flow === 'signUp' ? 'new-password' : 'current-password'}
			required
			minlength="8"
			bind:value={password}
		/>
	</label>
	<button class="btn" disabled={pending}>{title}</button>
</form>

<p class="mt-6 text-sm">
	{#if flow === 'signIn'}
		<a href={signUpHref}>Create an account</a>
	{:else}
		<a href={signInHref}>Already have an account</a>
	{/if}
</p>

<Dialog.Root bind:open={errorOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="scrim fixed inset-0 z-40" />
		<Dialog.Content
			class="dialog fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2"
		>
			<Dialog.Title class="text-lg font-semibold">Could not continue</Dialog.Title>
			<Dialog.Description class="muted mt-2 text-sm">{error}</Dialog.Description>
			<Dialog.Close class="btn mt-4 px-3 py-1.5 text-sm">Close</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
