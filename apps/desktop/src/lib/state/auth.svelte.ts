import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';
import type { ConvexClient } from 'convex/browser';
import { api } from '@stack/backend/api';

const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'auth_refresh';

function read(key: string): string | null {
	if (!browser) return null;
	return localStorage.getItem(key);
}

function write(key: string, value: string | null) {
	if (!browser) return;
	if (value) localStorage.setItem(key, value);
	else localStorage.removeItem(key);
}

export type AuthState = {
	readonly isLoading: boolean;
	readonly isAuthenticated: boolean;
	readonly fetchAccessToken: (args: { forceRefreshToken: boolean }) => Promise<string | null>;
	signIn: (params: {
		email: string;
		password: string;
		flow: 'signIn' | 'signUp';
	}) => Promise<{ error?: string }>;
	signOut: () => Promise<void>;
};

export function createAuthState(client: ConvexClient): AuthState {
	let token = $state<string | null>(read(TOKEN_KEY));
	let refreshToken = $state<string | null>(read(REFRESH_KEY));
	let loading = $state(browser);

	if (browser) {
		queueMicrotask(() => {
			loading = false;
		});
	}

	function setTokens(t: { token: string; refreshToken: string } | null | undefined) {
		if (!t) {
			token = null;
			refreshToken = null;
			write(TOKEN_KEY, null);
			write(REFRESH_KEY, null);
			return;
		}
		token = t.token;
		refreshToken = t.refreshToken;
		write(TOKEN_KEY, t.token);
		write(REFRESH_KEY, t.refreshToken);
	}

	async function fetchAccessToken({
		forceRefreshToken
	}: {
		forceRefreshToken: boolean;
	}): Promise<string | null> {
		if (forceRefreshToken && refreshToken) {
			try {
				const result = await client.action(api.auth.signIn, { refreshToken });
				if (result?.tokens) {
					setTokens(result.tokens);
					return result.tokens.token;
				}
				setTokens(null);
				return null;
			} catch {
				setTokens(null);
				return null;
			}
		}
		return token;
	}

	async function signIn(params: {
		email: string;
		password: string;
		flow: 'signIn' | 'signUp';
	}): Promise<{ error?: string }> {
		try {
			const result = await client.action(api.auth.signIn, {
				provider: 'password',
				params: { email: params.email, password: params.password, flow: params.flow }
			});
			if (result?.tokens) {
				setTokens(result.tokens);
				client.setAuth(async () => result.tokens?.token ?? null);
				return {};
			}
			return { error: 'Those details were not accepted.' };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Sign-in failed.';
			return { error: message };
		}
	}

	async function signOut(): Promise<void> {
		try {
			await client.action(api.auth.signOut, {});
		} catch {
			// Local sign-out still clears the stored session.
		}
		setTokens(null);
		client.setAuth(async () => null);
	}

	return {
		get isLoading() {
			return loading;
		},
		get isAuthenticated() {
			return token !== null;
		},
		fetchAccessToken,
		signIn,
		signOut
	};
}

const AUTH_KEY = Symbol('stack-auth');

export function setAuthState(auth: AuthState): AuthState {
	setContext(AUTH_KEY, auth);
	return auth;
}

export function getAuthState(): AuthState {
	const auth = getContext<AuthState | undefined>(AUTH_KEY);
	if (!auth) throw new Error('Auth state is missing. Set it in the root layout.');
	return auth;
}
