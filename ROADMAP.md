# Roadmap

This file tracks where the project actually stands — read this after `docs/00-repo-structure.md` and `AGENTS.md` when picking the work back up, especially from a different AI session/tool than the one that made the last change.

## Vision

Personal site built around `/software`, a portfolio section. `/` redirects to `/software`.

`/software` has two completely different interactive shells:

- **Desktop XP** (wide viewports): an interactive Windows XP-style desktop — icons, draggable/resizable windows, taskbar, start menu.
- **Nokia 3310** (narrow viewports): an interactive image of the physical phone — real `<button>` elements overlaid on the keypad (D-pad, OK, back, numeric keys), and a monochrome text-menu display overlay.

Desktop XP and Nokia 3310 are treated as two largely independent builds now (not "one simple shell to validate the data model, one complex one"): **the Desktop track is being finished completely before the Nokia track starts.**

## Status

- [x] Bootstrap: Next.js (App Router + TS) static export, GitHub Actions deploy to GitHub Pages.
- [x] Redirect `/` → `/software` (client-side + meta-refresh fallback).
- [x] Shared content model + apps registry (`src/content/`).
- [ ] **Desktop XP track** — in progress (steps 1-2 done, step 5 substantially underway, see below).
- [ ] **Nokia 3310 track** — after Desktop XP is fully done.
- [ ] **Integration**: `ResponsiveShell` (CSS-based switch between the two shells) + final end-to-end QA + `docs/README.md` index.

## Key architecture decisions to remember

- Next.js App Router + TypeScript, `output: 'export'` for GitHub Pages — no server anywhere (no API routes, no middleware, no server-side redirects).
- No `public/CNAME` yet — custom domain not finalized.
- Prettier `proseWrap: "never"` (see `docs/02-prettier.md`): docs/README paragraphs and list items are single-line; the same convention is applied by hand to code comments (Prettier doesn't touch those).
- Everything — code, comments, filenames, docs, and site content/UI copy — is in English (see `AGENTS.md`).
- Git: never commit or push automatically; suggest a one-line gitmoji-prefixed commit message and let the user commit/push themselves.
- Asset licensing discipline: verify an explicit open license (CC0 metadata, a repo's own `LICENSE` file, etc.) before using any third-party asset.
- Shared content model risk: while heads-down on the Desktop XP track, avoid letting Desktop-specific assumptions leak into `src/content/` — the Nokia shell won't validate that model until much later now, so a hidden incompatibility would surface late.

## Roadmap detail

### Desktop XP track (do first, finish completely before touching Nokia)

1. ✅ Vendor/scope `XP.css` (`postcss-prefix-selector`, `.win-xp-shell` prefix) so its bare-element rules never leak → [`docs/06-css-scoping-xp-css.md`](./docs/06-css-scoping-xp-css.md).
2. ✅ Static `Desktop`/`Taskbar`/`StartMenu`/`DesktopIcon` (no drag yet), wired to the apps from `src/content/apps-registry.ts`. Windows open (via desktop icon double-click or Start menu), close, and focus/cascade, all with plain `useState` — no Zustand yet, that's step 3.
3. Window manager: `react-rnd` + Zustand (`useWindowManagerStore`) → new `docs/` notes (state management, drag/resize).
4. Real window content components (`ProjectsApp`, `AboutApp`, `ContactApp`, `EducationApp`, `ResumeApp`, `ExperienceApp`).
5. Desktop visual polish (palette, wallpaper, details) + Desktop-specific QA.

### Nokia 3310 track (after Desktop XP is considered finished)

6. Device asset (image/SVG of the phone) + overlay layout: real `<button>` elements positioned over the keypad regions (not an image-map — keeps it accessible/focusable) + the screen overlay area.
7. `useNokiaStore` (Zustand): `currentScreen`, `selectedIndex`, `screenStack` for the "back" key.
8. Menu screens reading from the same `src/content/` data, adapted/truncated for the tiny monochrome display.
9. Display font: verify its license before adopting (options: a system monospace fallback, safest; or an open pixel font like "Press Start 2P" on Google Fonts, OFL — check first, same discipline as the icons).
10. Nokia visual polish (palette, monochrome LCD look) + Nokia-specific QA.

### Integration (last)

11. `ResponsiveShell`: CSS-based switch (`hidden md:block` / `block md:hidden`) between Desktop XP and Nokia — never `window.matchMedia` (would cause a hydration mismatch on this fully static/prerendered site, see `docs/03-nextjs-concepts.md`).
12. Final end-to-end QA (see the Verification checklist below) and a `docs/README.md` index of every note in `docs/`, in reading order.

## Verification checklist (once both shells exist)

1. `npm run dev`: resize the browser window across the `md` breakpoint — no flash/hydration mismatch.
2. `npm run build`: must complete cleanly; `out/` should contain `index.html` (redirect), `software/index.html`, `404.html`.
3. Smoke test the pure static build: `npm run build && npx serve out` (or `python3 -m http.server` inside `out/`) — verify the redirect, asset loading, and the custom 404.
4. Disable JavaScript in DevTools, reload `/` — the meta-refresh fallback should still redirect, and/or the visible fallback link should work.
5. Accessibility: XP title-bar contrast, Nokia display contrast, and confirm the Nokia's overlay keys are real focusable `<button>`s, not just clickable regions on an image.
6. CI: the `build` job in `.github/workflows/deploy.yml` must fail (and block deploy) on a broken build.

## Open questions / pending decisions

- Custom domain not chosen — no `public/CNAME` yet (see `README.md`).
- Nokia display font not chosen yet — needs a license check before adoption (see step 9 above).
- ~~Whether to commit the full Windows XP High Resolution Icon Pack (~172MB/557 files) to the repo, or keep cherry-picking individual files as needed~~ — decided: keep cherry-picking, the full pack (plus the separate `reference-icons/` pack the favicon came from) stays local-only, now `.gitignore`d rather than just untracked.

## Where to look

- `docs/00-repo-structure.md` — a map of the repo. Read this first.
- `AGENTS.md` — conventions every AI/human working on this repo should follow (language, formatting, git workflow, housekeeping, asset provenance). Read this second.
- `docs/` — concept notes in reading order after that. More will be added as the Desktop/Nokia tracks progress (see the roadmap detail above for which ones are coming).
- `README.md` — how to run/build/deploy the site, plus asset credits.
- `src/content/` — the shared data model and app registry; the single source of truth both shells read from.
