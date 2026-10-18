---
name: write-workflow
description: Write a playbook under docs/workflow/.
disable-model-invocation: true
---

# Write a playbook

A **playbook** is a reusable human + agent procedure. Dated logs and product law stay elsewhere.

If `writing-for-agents` is reachable, read it before drafting.

## 1. Open the shelf

Repo root = git root, else workspace root. Shelf = `docs/workflow/`.

If the directory is missing, create it. If `docs/workflow/README.md` is missing, write the index in [TEMPLATE.md](TEMPLATE.md).

**Done when:** `docs/workflow/` exists and `README.md` has a `Workflow | When` table.

## 2. Scope

From the user and the repo, name:

- kebab-case filename (`go-live.md`, not a date)
- title
- one **when** line (the README trigger)
- Agent vs Human split

If Roles or phases are still foggy, ask one tight round: who does each step, what the human-only gates are (secrets, dashboards, live accounts), and the checkable end state.

**Done when:** filename, title, when-line, and role split are named.

## 3. Pick the shape

Read the README. If a sibling playbook exists, read one and match its shape. Else use [TEMPLATE.md](TEMPLATE.md).

**Done when:** the target file's section order is chosen.

## 4. Draft

Write `docs/workflow/<filename>.md`. Every phase ends on a checkable **Done when:**. The Roles table names every human-only gate. Handoffs use **what**, **how**, and **done when**. Secrets and live ids stay `EXAMPLE_*` / `ALL_CAPS` placeholders. Point at contract docs that already exist; leave product rules in `AGENTS.md` / architecture docs.

**Done when:** the file exists, every phase has a **Done when:**, and Roles covers every human-only gate.

## 5. Index

Add or refresh the README row (`Workflow | When`). The workflow README is the only index. Leave root `AGENTS.md` and `CLAUDE.md` unchanged.

**Done when:** the README row is present.

## 6. Hand back

Give the user the path and the when-line.

**Done when:** they have both.
