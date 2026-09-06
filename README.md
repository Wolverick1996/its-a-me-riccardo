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

The desktop icons under `public/icons/desktop/` come from the [Windows XP High Resolution Icon Pack](https://github.com/marchmountain/-Windows-XP-High-Resolution-Icon-Pack) by marchmountain, licensed CC0 1.0 Universal.

The Desktop XP window styling is built on [XP.css](https://botoxparty.github.io/XP.css/) (MIT). The "Pixelated MS Sans Serif" font it bundles is a fan recreation by ["lou" on FontStruct](https://fontstruct.com/fontstructions/show/1384746), licensed CC BY-SA 3.0 — not the real Microsoft font. The "Perfect DOS VGA 437 Win" font is by Zeh Fernando, free for personal and commercial use.
