# README.md (create only when missing)

```markdown
# Workflows

Repeatable human + agent playbooks. Reach for one when the same setup or cutover comes around again. Product rules stay in `AGENTS.md` and architecture docs.

| Workflow | When |
| --- | --- |
```

# Playbook

```markdown
# Workflow: <name>

<Who this is for and what the repeatable job is. One short paragraph or a numbered list of outcomes.>

Reference: <links to contracts, env docs, or the dated log for this run — not product law.>

---

## Roles

| | Agent | Human |
| --- | --- | --- |
| Writes | <code, tests, contract docs> | — |
| Sets on the deployment | <only with explicit approval> | <env vars, secrets> |
| Dashboard / live account | — | <rows, customers, tokens> |
| Git | Runs checks; waits | Asks for commit / PR |

If a step needs a secret, a dashboard row, or a live-account click, stop and hand the human **what**, **how**, and **done when**.

---

## Preconditions

- <access, CLI login, which process must stay running>

---

## 1. <phase>

<Ordered steps. Name the actor in the heading when the phase is human-only.>

**Done when:** <observable bound — a URL works, a status code, a UI state.>

---

## 2. <phase>

**Done when:** <…>

---

## Agent checklist

1. Confirm the human vs agent split before writing code.
2. Keep human-owned gates in the playbook the same day the capability ships.
3. Stop at the last checkable **Done when:**. Live is what the human has seen.
```
