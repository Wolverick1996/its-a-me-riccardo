# It's-a me, Riccardo!

Personal website, built with [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS) and exported as a static site for [GitHub Pages](https://pages.github.com/).

- `/software` — Windows XP-inspired interactive desktop on wide viewports, a Nokia 3310-inspired interactive device on mobile. Currently the only implemented section.
- `/` redirects to `/software` (see [`docs/03-nextjs-concepts.md`](./docs/03-nextjs-concepts.md)).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building the static site

```bash
npm run build
```

This runs `next build` with `output: 'export'` and produces a self-contained `out/` folder — see [`docs/04-static-export-github-pages.md`](./docs/04-static-export-github-pages.md) for why this is needed and what it means.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages. See [`docs/05-ci-cd-github-actions.md`](./docs/05-ci-cd-github-actions.md) for a line-by-line explanation.

The custom domain isn't finalized yet, so there's currently no `public/CNAME` file. Once a domain is chosen: add a `public/CNAME` file containing just that domain, and set it under repository **Settings → Pages → Custom domain** on GitHub.

## Docs

This project doubles as a learning exercise, so `docs/` contains short notes explaining the non-obvious concepts introduced along the way (Next.js Server/Client Components, static export, state management, etc.), each anchored to the actual code it describes.

## Credits

### Openly licensed

- The desktop icons under `public/icons/desktop/` come from the [Windows XP High Resolution Icon Pack](https://github.com/marchmountain/-Windows-XP-High-Resolution-Icon-Pack) by marchmountain, licensed CC0 1.0 Universal.

- The site favicon (`src/app/icon.svg`) is the Windows XP flag emblem from the "Plasma5-WinXPSVG" icon theme by blackysgate.de, licensed CC0 1.0 Universal (verified via the file's own embedded RDF metadata).

- The login screen's placeholder account picture (`public/user-7.svg`, until a real photo replaces it) is from the same "Plasma5-WinXPSVG" icon theme, also CC0 1.0 Universal.

- The Desktop XP window styling is built on [XP.css](https://botoxparty.github.io/XP.css/) (MIT). The "Perfect DOS VGA 437 Win" font it bundles (used for `pre`) is by Zeh Fernando, free for personal and commercial use.

- The Desktop shell's window/taskbar/Start Menu/desktop-icon chrome and the login screen's fine-print help text (`fonts/fs-tahoma-8px.woff2`, shared by `src/styles/desktop/desktop-shell.css` and `login-screen.css`) use ["fs Tahoma 8px"](https://fontstruct.com/fontstructions/show/735108) by ETHproductions on FontStruct, licensed CC BY-SA 3.0 — a pixel-art recreation of Tahoma at its classic small-size bitmap hinting, not the real Microsoft font. It replaces XP.css's own bundled "Pixelated MS Sans Serif" recreation, no longer used or shipped here.

### Not openly licensed

- The taskbar Start button under `public/start-button/` is cropped from "XP BIG text & flag 51pixels.png", an attachment shared by forum user juniper7 in the ["XP Button Biggies"](https://coddec.github.io/Classic-Shell/www.classicshell.net/forum/viewtopic258f.html?p=35366) thread on the Classic Shell forum (Jan 29, 2018) — the artwork itself is Microsoft's own Luna theme button design.

- `public/wallpaper/Bliss.jpg` is the real Windows XP default wallpaper photo, by Charles O'Rear/Getty Images, licensed to Microsoft for Windows XP.

- The Windows XP system sounds under `public/sounds/` are Microsoft's own copyrighted assets, sourced from [an archive.org upload](https://archive.org/details/windowsxpstartup_201910) of the original system sound set.

- The cursors under `public/cursors/` are extracted from a [Windows XP cursor set](https://www.rw-designer.com/cursor-set/windows-xp-1) uploaded by "nibbler" on rw-designer.com — per that upload's own readme, the bitmaps themselves are Microsoft's original Windows XP cursor artwork, not the uploader's own work.

> ### Legal Notice & Disclaimer
>
> This website is a non-commercial, fan-made portfolio project created solely for educational, demonstration, and entertainment purposes. It is not affiliated with, authorized, sponsored, or endorsed by Microsoft Corporation.
>
> Windows XP, the "Luna" user interface, system sounds, logos, and trademarks are the exclusive property of Microsoft Corporation and their respective owners. External audio assets are linked strictly for historical preservation purposes under fair use guidelines. No copyright infringement is intended.
