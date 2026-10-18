import { render } from 'vitest-browser-svelte';
import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import DeleteNoteDialog from './DeleteNoteDialog.svelte';

it('opens the delete dialog and cancels', async () => {
	render(DeleteNoteDialog);
	await page.getByRole('button', { name: 'Delete note' }).click();
	await expect.element(page.getByRole('heading', { name: 'Delete this note?' })).toBeVisible();
	await page.getByRole('button', { name: 'Cancel' }).click();
	await expect
		.element(page.getByRole('heading', { name: 'Delete this note?' }))
		.not.toBeInTheDocument();
});
