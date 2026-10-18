# Backend and data

**Purpose.** What Convex stores and how functions behave.

**Covers.** Tables, indexes, and the public exception.

**Does not cover.** The sign-in screen. See [frontend.md](frontend.md).

`items` holds `userId`, `text`, and `createdAt`, indexed by `by_user`. `items.list` takes 50. `items.create` trims text and rejects lengths outside 1–200. `items.remove` deletes an owned row and returns `{ changed: true }`.

`waitlist` holds a normalized email, indexed by `by_email`. `waitlist.join` is the only public function that skips auth. A repeat address returns `{ created: false }`.

Auth tables come from `@convex-dev/auth`. Helpers live in `convex/lib/`.
