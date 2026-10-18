# Security and auth

**Purpose.** Who can read a note, and what headers the Workers send.

**Covers.** Password auth, the live session check, and response headers.

**Does not cover.** Google or Resend. Add those when a product needs them. `SITE_URL` is the frontend origin, not the `*.convex.site` host.

`requireAccount` loads the auth user and the `authSessions` row. The session must belong to that user and be unexpired. A deleted session fails closed.

`requireOwnedItem` returns `NOT_FOUND` for a missing note and for a note owned by someone else.

Both apps set `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` from `src/lib/server/securityHeaders.ts`. HTTPS responses also set HSTS. A canonical-host redirect waits until a real domain is named in Wrangler.
