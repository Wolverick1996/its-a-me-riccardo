# AGENTS.md and CLAUDE.md

These two files at the repo root aren't something we wrote — `create-next-app` generated them automatically, and they're kept in sync automatically too. They exist to give AI coding assistants (like the one you're using right now) instructions specific to this project.

## Two files, one piece of content

- **`AGENTS.md`** — [agents.md](https://agents.md) is an emerging cross-tool convention: a plain-Markdown file, at the repo root, that many different AI coding tools (not just one vendor's) agree to read for project-specific instructions. The idea is "one file, any agent."
- **`CLAUDE.md`** — this is Claude Code's own convention for the same kind of file. In this repo, its entire content is one line:

  ```
  @AGENTS.md
  ```

  The `@path` syntax is a Claude Code **import directive**: when Claude Code loads `CLAUDE.md`, that line tells it to also pull in the content of `AGENTS.md`, as if it were written directly inside `CLAUDE.md`. That's why `CLAUDE.md` doesn't duplicate the instructions — it just points at the file that actually has them, so there's a single source of truth instead of two files that could drift out of sync.

## What's actually inside `AGENTS.md`

```
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` ... before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` ...

<!-- END:nextjs-agent-rules -->
```

In plain terms: this Next.js release (16.3.4 at the time of writing) is recent enough that an AI model's training data might describe an older, different version of Next.js — different config options, different file conventions, sometimes different APIs entirely. So the framework leaves a note for whichever AI agent opens the repo: _"don't trust what you think you know about Next.js — go read the real docs, which are bundled right here in `node_modules/next/dist/docs/`, before writing code."_

This isn't a hypothetical: it's the literal reason [`docs/04-static-export-github-pages.md`](./04-static-export-github-pages.md) turned out accurate. Before wiring up `output: 'export'`, the docs at `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` were read first to confirm the config shape for this exact version, rather than assuming it matched older training data.

## Why this file looks "auto-generated" and shouldn't be hand-edited

The comment inside the block says it's _"written and re-added by `next dev`."_ Looking at the actual source (`node_modules/next/dist/server/lib/generate-agent-files.js`), here's what that means concretely:

- `next dev` checks `AGENTS.md`/`CLAUDE.md` for a block delimited by `<!-- BEGIN:nextjs-agent-rules -->` / `<!-- END:nextjs-agent-rules -->`.
- If the block is **missing or out of date**, it inserts/updates just that block — anything you write outside those markers (project-specific notes, house rules, etc.) is left untouched.
- If the block is **already there and current**, nothing is rewritten (`next dev` diffs the content first).

So the block is a "managed region" the framework owns, not something meant to be edited by hand — if you deleted it, the next `next dev` run would just add it back, showing up as an uncommitted change. Committing it as-is (which we did) keeps `git status` clean.

## Can we add our own instructions?

Yes — anything written **outside** the `BEGIN`/`END` markers in either file is left alone by the tooling. Project-specific house rules for AI agents live in `AGENTS.md` alongside the managed block (see the "Project guidelines" section below it), and `CLAUDE.md` keeps seeing them automatically through the `@AGENTS.md` import.
