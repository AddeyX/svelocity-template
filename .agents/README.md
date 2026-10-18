# Agent skills

Canonical project skills live in `.agents/skills/`. `.cursor/skills/` and `.claude/skills/` are symlinks to that folder.

| Skill                       | Purpose                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| `impeccable`                | UI work against `PRODUCT.md` and `DESIGN.md`                         |
| `cloudflare-deploy-ci`      | SvelteKit on the Cloudflare adapter, Wrangler, and the two workflows |
| `pr-audit-review`           | Review a pull request into `docs/pr-reviews/`                        |
| `pr-reconcile`              | Update a pull request after a review is implemented                  |
| `convex`                    | Core Convex skill                                                    |
| `convex-quickstart`         | Bring the demo backend up                                            |
| `convex-setup-auth`         | Password auth                                                        |
| `convex-create-component`   | Add a Convex component                                               |
| `convex-migration-helper`   | Schema changes                                                       |
| `convex-performance-audit`  | Bounded indexed reads                                                |
| `writing-for-agents`        | Edits to `AGENTS.md`, `CLAUDE.md`, and skills                        |
| `writing-great-skills`      | How a skill is written                                               |
| `write-workflow`            | New playbooks under `docs/workflow/`                                 |
| `validate-ci`               | `validate.yml` as gen, check, test, build                            |
| `svelte-core-bestpractices` | Svelte 5 runes                                                       |
| `svelte-code-writer`        | Svelte 5 docs lookup                                                 |

The six `convex*` skills are recorded in `skills-lock.json`. The others are committed source.
