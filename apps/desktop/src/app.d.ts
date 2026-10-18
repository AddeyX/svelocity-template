interface StackDesktop {
	platform: 'desktop';
	getVersion: () => Promise<string>;
	openExternal: (url: string) => Promise<void>;
}

declare global {
	interface Window {
		stackDesktop?: StackDesktop;
	}
	namespace App {}
}

export {};
