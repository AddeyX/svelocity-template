import { ConvexError } from 'convex/values';

export type ErrorCode = 'UNAUTHENTICATED' | 'NOT_FOUND' | 'INVALID';

export function fail(code: ErrorCode, message: string): never {
	throw new ConvexError({ code, message });
}
