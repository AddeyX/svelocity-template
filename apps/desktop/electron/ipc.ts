import { app, ipcMain, shell } from 'electron';
import { isSafeExternalUrl } from './url-safety.js';

/** Every channel validates its input here. The renderer is untrusted. */
export function registerIpcHandlers() {
	ipcMain.handle('app:getVersion', () => app.getVersion());

	ipcMain.handle('app:openExternal', (_event, url: unknown) => {
		if (typeof url !== 'string' || !isSafeExternalUrl(url)) {
			throw new Error('Blocked openExternal: only http(s) URLs are allowed');
		}
		return shell.openExternal(url);
	});
}
