import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers } from './ipc.js';
import { isSafeExternalUrl } from './url-safety.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_SERVER_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5175' : null;

function isAppUrl(url: string) {
	if (DEV_SERVER_URL && url.startsWith(DEV_SERVER_URL)) return true;
	if (!DEV_SERVER_URL && url.startsWith('file:')) {
		return url.split('#')[0]?.endsWith('/index.html') ?? false;
	}
	return false;
}

function createWindow() {
	const win = new BrowserWindow({
		width: 960,
		height: 720,
		minWidth: 360,
		minHeight: 500,
		title: 'Stack',
		backgroundColor: '#080616',
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			preload: path.join(__dirname, 'preload.cjs')
		}
	});

	win.webContents.setWindowOpenHandler(({ url }) => {
		if (isSafeExternalUrl(url)) void shell.openExternal(url);
		return { action: 'deny' };
	});

	win.webContents.on('will-navigate', (event, url) => {
		if (isAppUrl(url)) return;
		event.preventDefault();
		if (isSafeExternalUrl(url)) void shell.openExternal(url);
	});

	if (DEV_SERVER_URL) {
		void win.loadURL(DEV_SERVER_URL);
	} else {
		void win.loadFile(path.join(__dirname, '../build/index.html'));
	}
}

app.whenReady().then(() => {
	registerIpcHandlers();
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
