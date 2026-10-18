export function securityHeaders({ https }: { https: boolean }): Record<string, string> {
	const headers: Record<string, string> = {
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
	};
	if (https) {
		headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
	}
	return headers;
}
