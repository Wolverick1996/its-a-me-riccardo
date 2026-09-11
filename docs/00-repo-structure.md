# Repository structure

How this repo is organized, and why — a reference for structuring a static, multi-shell site like this one, not just an inventory of today's files. Read this first, before `AGENTS.md`.

## The core pattern: one data model, many shells

The site presents the same content through more than one interactive shell — a desktop-oriented experience and a mobile-oriented one — each with its own look and interaction model. The rule that keeps that manageable: **shells are presentation, `src/content/` is truth.** Content lives once, typed, in `src/content/`; every shell reads the same registry and renders it however fits its own paradigm. Adding a shell, or changing what an existing one looks like, should never require touching the data.

## Source (`src/`)

- `src/app/` — Next.js App Router pages; a folder maps directly to a URL (see [`docs/03-nextjs-concepts.md`](./03-nextjs-concepts.md)).
- `src/components/` — shared React components, grouped by what they belong to: one folder per shell, plus separate folders for cross-cutting pieces that don't belong to any single shell (e.g. a redirect component).
- `src/content/` — the shared data model: type definitions, a single registry of sections, and the content data itself. One place to add or change content, independent of how any shell displays it.
- `src/styles/` — vendored or hand-maintained CSS that falls outside the normal utility-CSS flow, one subfolder per shell that needs it. When a shell's styling comes from a third-party stylesheet built for a single-theme page, scope it under that shell's own wrapper class so its rules can never leak into another shell (see [`docs/06-css-scoping-xp-css.md`](./06-css-scoping-xp-css.md)).
- `src/store/` — Zustand stores for state a shell's components need to share directly rather than pass through props, one store per shell (see [`docs/10-window-manager-state.md`](./10-window-manager-state.md) for the Desktop XP one).

## Static assets (`public/`)

Anything here is served as-is at the site root once deployed. Group by asset kind (icons, backgrounds, etc.) rather than by shell, since assets can end up shared across shells.

## Docs and project tracking

- `docs/` — numbered notes, one per non-obvious concept, in reading order: a learning trail anchored to real code, not abstract theory.
- `ROADMAP.md` — status and plan: what's done, what's next, open decisions. Kept separate from structure/convention docs because it changes constantly, while the rest of this file shouldn't need to.
- `AGENTS.md` / `CLAUDE.md` — conventions for anyone working on the repo, human or AI.
- `README.md` — quickstart and credits.

## Config at the root

Standard tool configs (linter, formatter, TypeScript, framework config) live at the root as usual. Anything with project-specific reasoning behind a config choice gets a `docs/` note explaining why, rather than a comment nobody will read.

## Vendored third-party sources

A large third-party asset source kept around only to cherry-pick individual files from doesn't belong inside `src/` or `public/` — keep it outside those trees entirely (so bundlers and build tools never see it) and gitignored, copying in only the specific files actually used, under their original names for traceability.

## Growing this structure

New shell code goes in its own `src/components/<shell>/` folder; new content stays additive in `src/content/`; a new `docs/` note gets written whenever a new non-obvious pattern shows up. The goal is that this file keeps describing the shape of the repo without needing a rewrite every time a section gets added.
