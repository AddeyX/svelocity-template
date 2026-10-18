<script lang="ts">
	import { Dialog } from 'bits-ui';

	let { onconfirm }: { onconfirm?: () => void } = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="btn btn-quiet px-3 py-1.5 text-sm">Delete note</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay class="scrim fixed inset-0 z-40" />
		<Dialog.Content
			class="dialog fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2"
		>
			<Dialog.Title class="text-lg font-semibold">Delete this note?</Dialog.Title>
			<Dialog.Description class="muted mt-2 text-sm">
				The note is removed from your list. This cannot be undone.
			</Dialog.Description>
			<div class="mt-4 flex justify-end gap-2">
				<Dialog.Close class="btn btn-quiet px-3 py-1.5 text-sm">Cancel</Dialog.Close>
				<button type="button" class="btn btn-danger px-3 py-1.5 text-sm" onclick={() => onconfirm?.()}>
					Delete
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
