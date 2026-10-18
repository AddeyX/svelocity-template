# Backend

Convex is authoritative product state.

Before Convex work, read `convex/_generated/ai/guidelines.md` when it exists.

## Read when relevant

- Schema, ownership, and the public exception → `../../docs/architecture/backend-and-data.md`
- Session check → `../../docs/architecture/security-and-auth.md`

## Laws

- Authenticate every public function first.
- `waitlist.join` is the named public exception.
- Load and ownership-check foreign keys before writes.
- Bound inputs. Note text is 1–200 characters. A list page is 50 notes.
- Growing reads are indexed and bounded.
- A mutation changes state or throws. `items.remove` returns `{ changed: true }`.
- `waitlist.join` returns `{ created: false }` when the address is already stored.
- Client-visible failures use `ConvexError` codes `UNAUTHENTICATED`, `NOT_FOUND`, and `INVALID`.
- Public `query` and `mutation` live in Convex root modules. `convex/lib/` exports plain helpers only.
- A bug fix needs a regression test.
- Exceptions need a name, a test, an owner, and a reason.

## Validate

```bash
pnpm --filter @stack/backend check
pnpm --filter @stack/backend test
```
