# Static export and GitHub Pages

## The problem: Next.js "normally" expects a server

By default, Next.js is built around an always-on Node.js server: when a user visits a page, the server can run code on the fly (query a database, generate a redirect, read request cookies, etc.). That's what happens if you deploy it on **Vercel** — the hosting platform built by the creators of Next.js, which runs a real Node.js server behind the scenes and supports every "dynamic" Next.js feature out of the box (API routes, server-side redirects, ISR, and so on) — or on any other host that can run Node.

**GitHub Pages doesn't execute code.** It's a plain file server: you give it `.html`/`.css`/`.js` files and it serves them exactly as they are, to whoever requests them. There's no Node process running behind the scenes.

## The solution: `output: 'export'`

In [`next.config.ts`](../next.config.ts) we set:

```ts
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};
```

`output: "export"` tells Next.js: "don't assume there will be a server after the build — generate every final HTML file ahead of time, during `next build`, so I can be served by any static host." The result lands in the `out/` folder (which you'll find in `.gitignore` — it's a generated artifact, not something to commit: the CI pipeline generates it on every deploy, see [`docs/05-ci-cd-github-actions.md`](./05-ci-cd-github-actions.md)).

The other two options are direct consequences of the first:

- **`images: { unoptimized: true }`** — The `next/image` component normally optimizes images (resizing, format conversion) _at request time_, via a server-side service. Without a server, that's not possible: we disable automatic optimization and serve images as-is.
- **`trailingSlash: true`** — Makes the `/software` page get generated as the file `software/index.html` instead of `software.html`. This is more robust for a static host like GitHub Pages, because relative links inside the page (e.g. `./icon.svg`) resolve correctly relative to the right folder.

## What we lose (and why it matters to us)

With a static export, anything that requires a server **at request time** (as opposed to build time) stops working:

- **API routes** (endpoints like `/api/something`)
- **Middleware** (code that intercepts every request before it reaches the page)
- **`redirects()`/`rewrites()`** defined in `next.config.ts`
- **Server Actions**, **dynamic cookies**, **ISR** (periodic content regeneration)

For us, this has one very concrete consequence: **we can't do a "real" redirect** from the site's root (`/`) to `/software` (the kind of thing you'd do in a server-backed site with a simple `redirects()` entry in `next.config.ts`, or with middleware). We have to simulate it entirely in the browser, with a page that redirects itself as soon as it loads — that's the topic of [`docs/03-nextjs-concepts.md`](./03-nextjs-concepts.md).

## In practice: what `next build` generates

After `npm run build`, the `out/` folder already contains the ready-to-serve files, for example:

```
out/index.html          ← the home page ("/")
out/404.html             ← error page, GitHub Pages picks this up automatically
out/_next/static/...      ← compiled JS/CSS
```

(Once a custom domain is chosen, a `public/CNAME` file containing just that domain will show up here too, copied as `out/CNAME` — that's how GitHub Pages knows which domain to serve. There isn't one yet, see [`README.md`](../README.md).)

You can verify this yourself locally, with no Next.js server running at all, using a plain static file server:

```
npm run build
npx serve out
```

If the site still works identically served that way, you know it'll work on GitHub Pages too.
