# It's-a me, Riccardo!

Personal website, built with [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS) and exported as a static site for [GitHub Pages](https://pages.github.com/).

- `/software` — Windows XP-inspired interactive desktop on wide viewports, Windows Phone-inspired tile UI on mobile. Currently the only implemented section.
- `/` redirects to `/software` (see [`docs/02-nextjs-concepts.md`](./docs/02-nextjs-concepts.md)).

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

This runs `next build` with `output: 'export'` and produces a self-contained `out/` folder — see [`docs/03-static-export-github-pages.md`](./docs/03-static-export-github-pages.md) for why this is needed and what it means.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages. See [`docs/04-ci-cd-github-actions.md`](./docs/04-ci-cd-github-actions.md) for a line-by-line explanation.

The custom domain isn't finalized yet, so there's currently no `public/CNAME` file. Once a domain is chosen: add a `public/CNAME` file containing just that domain, and set it under repository **Settings → Pages → Custom domain** on GitHub.

## Docs

This project doubles as a learning exercise, so `docs/` contains short notes explaining the non-obvious concepts introduced along the way (Next.js Server/Client Components, static export, state management, etc.), each anchored to the actual code it describes.
