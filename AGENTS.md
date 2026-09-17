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

## Code comments

Comments explain the current code, contextually and concisely — not how it got here. Don't cite a reference screenshot, a `docs/` note, or any other external file as the source of a value or decision (that context belongs in the PR description or a `docs/` note if it's genuinely worth preserving, not in the comment); don't narrate history ("an earlier pass did X", "no longer used", "replaces the old Y") once the earlier version is gone — describe what's there now, not what changed. If a comment only makes sense by pointing outside the file it's in, rewrite it so the code and the comment are self-contained together.

## Language

All code, comments, filenames, docs, and site content (UI copy, portfolio text): English.

## Documentation (`docs/`)

- This project doubles as a learning exercise. Add a short `docs/` note for any non-obvious concept introduced (a new tool, a non-trivial pattern), anchored to the actual files that use it — not abstract theory.
- A note's subject is the process and what to carry forward from it, not a record of every attempt made along the way. Skip the play-by-play of drafts that didn't pan out and write the takeaway that survives it — the general rule, gotcha, or technique worth applying to a future, unrelated project.
- Keep the technical content itself pitched at the level of a reusable concept (a framework mechanism, a CSS rule, a build step), not the specific numbers or one-off details of the case that surfaced it. Anchor each note to the files that use the concept, but as illustration, not as the point of the note.
- A concept that already has a home gets extended there instead of forking a new, overlapping note. When reviewing docs, merge near-duplicate topics into one note and delete the one left empty by the merge, rather than letting the same kind of concept accumulate across separate files.
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
- A full Windows XP system sound set is kept locally (gitignored, not part of the repo). Whenever a change adds or touches a desktop interaction (minimize, restore, menu clicks, notifications, errors, etc.), check whether a matching sound from that set should be wired to it, the same way real XP pairs a sound with each of those events — don't assume silence is the default without checking (see [`docs/12-wiring-real-xp-sounds.md`](./docs/12-wiring-real-xp-sounds.md) for why a matching file existing still isn't proof it should be).
