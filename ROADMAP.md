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
- [ ] **Desktop XP track** — in progress (steps 1-3 and 5 done, step 4/visual polish substantially underway, see below).
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
- The vendored sound-set check (see `AGENTS.md`) applies here too: revisit it whenever a new desktop interaction is added.

## Roadmap detail

### Desktop XP track (do first, finish completely before touching Nokia)

1. ✅ Vendor/scope `XP.css` (`postcss-prefix-selector`, `.win-xp-shell` prefix) so its bare-element rules never leak → [`docs/06-css-scoping-xp-css.md`](./docs/06-css-scoping-xp-css.md).
2. ✅ `Desktop`/`Taskbar`/`StartMenu`/`DesktopIcon`, wired to the apps from `src/content/apps-registry.ts`. Windows open (via desktop icon double-click or Start menu) and close. Icons support rubber-band marquee multi-select and drag-and-drop repositioning within the grid → [`docs/11-desktop-icon-interactions.md`](./docs/11-desktop-icon-interactions.md).
3. ✅ Window manager: `react-rnd` + Zustand (`useWindowManagerStore`) — real drag/resize, focus/z-order, minimize, maximize/restore, and a taskbar-button toggle (focus/minimize/restore) matching real XP → [`docs/10-window-manager-state.md`](./docs/10-window-manager-state.md).
4. 🚧 Desktop visual polish (palette, wallpaper, details) + Desktop-specific QA — substantially underway already: window/taskbar chrome fidelity, DPI scaling, and icon/window interaction polish landed alongside steps 2-3 (see [`docs/07-verifying-ui-fidelity.md`](./docs/07-verifying-ui-fidelity.md), [`docs/08-dpi-scaling.md`](./docs/08-dpi-scaling.md), [`docs/09-desktop-shell-lessons.md`](./docs/09-desktop-shell-lessons.md)), plus a working taskbar system tray (`VolumeControl`, a real XP-style volume flyout backed by `useVolumeStore` — see the sound-set note above) and a real XP cursor set (arrow, resize, AppStarting/Busy hourglass states) replacing the host OS's own pointer throughout the shell — see [`docs/13-custom-cursor-system.md`](./docs/13-custom-cursor-system.md). Remaining: a dedicated palette/wallpaper accuracy pass and a full Desktop-specific QA sweep.
5. ✅ Startup/Login/Welcome/Shutdown session flow (`StartupScreen`, `LoginScreen`, `WelcomeScreen`, `ShutdownScreen`, `useSessionStore`) — the software page opens on a boot screen, then a real-screenshot-measured XP login screen (see [`docs/07-verifying-ui-fidelity.md`](./docs/07-verifying-ui-fidelity.md) and [`docs/09-desktop-shell-lessons.md`](./docs/09-desktop-shell-lessons.md)); the account tile plays the real XP startup/logon sounds and lands on the Desktop (see [`docs/12-wiring-real-xp-sounds.md`](./docs/12-wiring-real-xp-sounds.md) for exactly which login/logoff/shutdown events are wired and why). Account avatar is a placeholder, to be swapped for a real photo in step 7 below. The Start menu's real XP "Log Off"/"Turn Off" pair both route through `ShutdownScreen`; "Turn Off" opens a pixel-measured "Turn off computer" dialog (`TurnOffDialog`) offering Stand By/Turn Off (no Restart — deliberately not implemented), which preserves every open window's exact state across a Stand By/resume cycle (see [`docs/10-window-manager-state.md`](./docs/10-window-manager-state.md) for how).
6. Browser-zoom accessibility pass: right now, browser page zoom (Ctrl +/-) resizes only _some_ of the shell. `--xp-scale`/`--login-scale` (vh-based) elements deliberately stay a constant physical size under zoom, by design — the whole point of that scale system is to render "as if" always at the reference resolution, regardless of the actual window size. But plenty of other sizing is still flat, unscaled `px` (most of vendored `XP-scoped.css`'s widget internals — borders, shadows, tree-view guides, checkbox glyphs, ~380 declarations — plus any stray spot in our own files), and that flat sizing _does_ grow/shrink with zoom. The result: a user who zooms in to enlarge the UI (an accessibility need, not a preference) gets an inconsistent, partially-scaled result instead of a uniformly bigger one. Needs a real decision + fix, not just a note. Also want broader keyboard-shortcut parity with real XP, not just zoom: the Start menu already has a slice of this (mnemonic accelerators on "Log Off"/"Turn Off Computer", Ctrl+Escape and a bare Windows/Cmd-key tap to open the menu itself — see `StartMenu.tsx`/`Desktop.tsx`), but real XP has plenty more that isn't reproduced yet (Alt+F4 to close the focused window, Alt+Tab to cycle them, arrow-key navigation within an open menu, a real Tab focus order across the shell).
7. Real window content components (`ProjectsApp`, `AboutApp`, `ContactApp`, `EducationApp`, `ResumeApp`, `ExperienceApp`), done last on purpose — includes both the components/content types and writing the real content (bio, real projects, resume, etc.) that replaces today's placeholder text in `src/content/`, plus swapping the login screen's placeholder avatar for a real photo.

### Nokia 3310 track (after Desktop XP is considered finished)

8. Device asset (image/SVG of the phone) + overlay layout: real `<button>` elements positioned over the keypad regions (not an image-map — keeps it accessible/focusable) + the screen overlay area.
9. `useNokiaStore` (Zustand): `currentScreen`, `selectedIndex`, `screenStack` for the "back" key.
10. Menu screens reading from the same `src/content/` data, adapted/truncated for the tiny monochrome display.
11. Display font: verify its license before adopting (options: a system monospace fallback, safest; or an open pixel font like "Press Start 2P" on Google Fonts, OFL — check first, same discipline as the icons).
12. Nokia visual polish (palette, monochrome LCD look) + Nokia-specific QA.

### Integration (last)

13. `ResponsiveShell`: CSS-based switch (`hidden md:block` / `block md:hidden`) between Desktop XP and Nokia — never `window.matchMedia` (would cause a hydration mismatch on this fully static/prerendered site, see `docs/03-nextjs-concepts.md`).
14. Final end-to-end QA (see the Verification checklist below) and a `docs/README.md` index of every note in `docs/`, in reading order.

## Verification checklist (once both shells exist)

1. `npm run dev`: resize the browser window across the `md` breakpoint — no flash/hydration mismatch.
2. `npm run build`: must complete cleanly; `out/` should contain `index.html` (redirect), `software/index.html`, `404.html`.
3. Smoke test the pure static build: `npm run build && npx serve out` (or `python3 -m http.server` inside `out/`) — verify the redirect, asset loading, and the custom 404.
4. Disable JavaScript in DevTools, reload `/` — the meta-refresh fallback should still redirect, and/or the visible fallback link should work.
5. Accessibility: XP title-bar contrast, Nokia display contrast, and confirm the Nokia's overlay keys are real focusable `<button>`s, not just clickable regions on an image.
6. CI: the `build` job in `.github/workflows/deploy.yml` must fail (and block deploy) on a broken build.

## Open questions / pending decisions

- Custom domain not chosen — no `public/CNAME` yet (see `README.md`).
- Nokia display font not chosen yet — needs a license check before adoption (see step 10 above).
- ~~Whether to commit the full Windows XP High Resolution Icon Pack (~172MB/557 files) to the repo, or keep cherry-picking individual files as needed~~ — decided: keep cherry-picking, the full pack (plus the separate `reference-icons/` pack the favicon came from) stays local-only, now `.gitignore`d rather than just untracked.
- ~~Unresolved, unlike the icon pack: several assets (XP system sounds, the wallpaper, the Start button crop) have no verified open license — real Microsoft/rightsholder-owned material, not CC0/OFL-licensed recreations like the icons or fonts credited in `README.md`.~~ — decided: `README.md`'s Credits now splits "Openly licensed" from "Not openly licensed", crediting that second group plainly as their real owners' property with one shared fair-use disclaimer, since this is a non-commercial, non-monetized personal portfolio, not a commercial product.

## Where to look

- `docs/00-repo-structure.md` — a map of the repo. Read this first.
- `AGENTS.md` — conventions every AI/human working on this repo should follow (language, formatting, git workflow, housekeeping, asset provenance). Read this second.
- `docs/` — concept notes in reading order after that. More will be added as the Desktop/Nokia tracks progress (see the roadmap detail above for which ones are coming).
- `README.md` — how to run/build/deploy the site, plus asset credits.
- `src/content/` — the shared data model and app registry; the single source of truth both shells read from.
