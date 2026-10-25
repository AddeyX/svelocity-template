# Tokens

`tokens.css` is the Tailwind v4 theme. `styles.css` holds the shared element and component classes (`.btn`, `.field`, `.dialog`). Every app's `layout.css` imports both, after `tailwindcss`.

## Laws

- Change a color in `DESIGN.md` first, then match it here.
- Colors and component classes live here, not in an app stylesheet.
- Every rule in `styles.css` sits inside `@layer base` or `@layer components`, so a utility on the same element wins.
- A second theme overrides the `--color-*` variables under a selector such as `:root[data-theme='light']`.
