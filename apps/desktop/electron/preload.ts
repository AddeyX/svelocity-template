import { contextBridge, ipcRenderer } from 'electron';

/**
 * The only bridge. Add a capability as its own method, never by exposing
 * ipcRenderer, fs, or shell.
 */
const desktopApi = {
	platform: 'desktop' as const,
	getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
	openExternal: (url: string): Promise<void> => ipcRenderer.invoke('app:openExternal', url)
};

export type DesktopApi = typeof desktopApi;

contextBridge.exposeInMainWorld('stackDesktop', desktopApi);
