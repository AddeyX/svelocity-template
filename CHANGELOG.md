# Changelog

## [Unreleased]

### Added

- Desktop shell: SvelteKit hash routes inside Electron.
- Mobile shell: SvelteKit static app for Capacitor.
- `@stack/tokens/styles.css`: shared base and component classes in Tailwind layers.
- `docs/workflow/site.md`: ship the site as its own repo, or wire in the waitlist.

### Changed

- The site prerenders every page and no longer depends on Convex. The waitlist form is removed; `waitlist.join` stays in the backend.
- Utilities now override `.btn`, `.field`, and the base element styles. `class="btn px-3"` gets the smaller padding.
- `tokens.css` uses `@theme`, so a second theme can override the `--color-*` variables at runtime.

## [0.0.1] - 2026-10-14

### Added

- Initial template: a private note list and a public waitlist.
