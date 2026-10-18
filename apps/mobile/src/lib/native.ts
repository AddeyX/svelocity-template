import { Capacitor } from '@capacitor/core';

/** Capacitor stays in this module. Screens call these functions. */
export function platform(): string {
	return Capacitor.getPlatform();
}

export function isNative(): boolean {
	return Capacitor.isNativePlatform();
}

export async function prepareShell() {
	if (!isNative()) return;
	const { StatusBar, Style } = await import('@capacitor/status-bar');
	const { SplashScreen } = await import('@capacitor/splash-screen');
	await StatusBar.setStyle({ style: Style.Light });
	await SplashScreen.hide();
}

export async function bindBackButton(goBack: () => void) {
	if (!isNative()) return;
	const { App } = await import('@capacitor/app');
	await App.addListener('backButton', ({ canGoBack }) => {
		if (canGoBack) goBack();
	});
}
