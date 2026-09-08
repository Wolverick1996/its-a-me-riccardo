<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guidelines

## Orientation

Read [`docs/00-repo-structure.md`](./docs/00-repo-structure.md) for a map of the repo, then [`ROADMAP.md`](./ROADMAP.md) for what's done, what's next, and open decisions — so work can resume across sessions and across different AI tools. Update `ROADMAP.md` whenever a milestone completes or a plan changes; don't let it drift out of sync with the code.

## Formatting

Formatting is enforced by Prettier (`npm run format`, or `npm run format:check` to verify without writing) — see `.prettierrc.json`. `proseWrap: "never"` is set there so docs/README paragraphs are never hard-wrapped at a fixed column: Prettier collapses each paragraph or list item to a single line and lets the editor soft-wrap it. Prettier does not reformat prose inside code comments, though, so apply the same single-line convention to comments by hand: one comment, one line, however long, rather than hard-wrapped at some fixed column — the editor soft-wraps it the same way it does docs/README prose.

## Language

All code, comments, filenames, docs, and site content (UI copy, portfolio text): English.

## Documentation (`docs/`)

- This project doubles as a learning exercise. Add a short `docs/` note for any non-obvious concept introduced (a new tool, a non-trivial pattern), anchored to the actual files that use it — not abstract theory.
- Number notes sequentially (`00`, `01`, `02`, …), no gaps. Order them so the sequence reads as a coherent narrative, not by when they happened to be written and not with slots pre-reserved for future topics. Renumber existing notes (and fix their cross-links) if a new one changes the logical order.
- `docs/README.md` should index all notes in reading order once it exists (planned near the end of the roadmap, not yet created).

## Git

- Never commit or push. When a milestone or logical chunk of work is done, suggest a commit message and stop — the user reviews the diff and commits/pushes themselves.
- Keep suggested commit messages to a single line, prefixed with a [gitmoji](https://gitmoji.dev/) matching the type of change.

## Housekeeping

- Keep `.gitignore` scoped to tooling actually in use (npm + GitHub Pages — no Yarn/pnpm/CRA/Vercel boilerplate).
- Remove unused scaffold/placeholder assets rather than leaving them around.
- Run `npm run build` and `npm run lint` after non-trivial changes.
- Third-party asset licenses (icons, fonts, XP.css) are credited once, in `README.md`'s Credits section — don't repeat the details elsewhere, just link to it.
- `src/styles/desktop/XP-scoped.css` is vendored and scoped under `.win-xp-shell` — see [`docs/06-css-scoping-xp-css.md`](./docs/06-css-scoping-xp-css.md) for how and why. Edit it directly for tweaks; there's no build step to re-run.
