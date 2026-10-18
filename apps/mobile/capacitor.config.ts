import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'app.stack.mobile',
	appName: 'Stack',
	webDir: 'build',
	// Live reload: uncomment only while a device is pointed at this machine.
	// Remove it before a production build. A shipped server.url loads your laptop.
	// server: { url: 'http://192.168.1.20:5176', cleartext: true },
	plugins: {
		SplashScreen: {
			launchShowDuration: 800,
			launchAutoHide: true,
			backgroundColor: '#080616'
		}
	}
};

export default config;
