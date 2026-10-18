# PR Audit & Review — Reference

Run after reading [SKILL.md](SKILL.md).

---

## GitHub commands

### List open PRs

```bash
gh pr list --state open --json number,title,headRefName,author,updatedAt \
  --template '{{range .}}#{{.number}}  {{.title}}  ({{.headRefName}}, @{{.author.login}}){{"\n"}}{{end}}'
```

### PR metadata

```bash
gh pr view <number> --json title,body,additions,deletions,changedFiles,headRefName,baseRefName,state,url
```

### PR diff

```bash
gh pr diff <number>
```

### Closed or merged PRs

`gh pr view <number>` and `gh pr diff <number>` work for any PR number, not only open ones.

---

## Output path

Write reviews to:

```text
docs/pr-reviews/pr-<number>-review.md
```

Create `docs/pr-reviews/` if it does not exist.

### Filename pattern

| Part | Example |
|------|---------|
| PR number | `37` |
| Full path | `docs/pr-reviews/pr-37-review.md` |

### Markdown header

Start the file with a title line that includes PR number, title, branch stats, and state:

```markdown
# PR #37 Review — feat(plan): short title from gh

Branch `headRefName` → `baseRefName` · +607 / −114 · 15 files · OPEN
```

Pull stats from `gh pr view <number> --json title,additions,deletions,changedFiles,headRefName,baseRefName,state`.

---

## Finding format

Use severity subheadings under **Findings**:

```markdown
### Critical — short label

**Where:** `path/to/file.ts:42`
**What:** …
**Why it matters:** …
**Suggested fix:** …
```

Repeat for High, Medium, Low. If none at a severity, omit that subsection or state "None."

---

## Fix plan format

Group under **Must fix before merge**, **Should fix soon**, and **Optional follow-ups**. Each item:

```markdown
- **Task:** …
  - **Files:** …
  - **Acceptance criteria:** …
  - **Effort:** S | M | L | XL
  - **Risk of fix:** …
```

---

## Optional verification

Run only when quick and relevant to the changed areas:

```bash
pnpm check
pnpm test
```

If not run, state that plainly in Executive Summary and Risk Assessment.

---

## Project context (Cairno)

When reviewing Cairno PRs, skim these if the diff touches UX, product scope, or architecture:

- `VISION.md`, `PRODUCT.md` — product intent and register
- `DESIGN.md` — visual system when UI changes
- `docs/ARCHITECTURE.md` — structural expectations
- `AGENTS.md` — stack and conventions (Svelte 5 runes, bits-ui, Convex, Tailwind v4 tokens)

Do not require edits to these docs unless the PR introduces structural changes the review identifies as gaps.
