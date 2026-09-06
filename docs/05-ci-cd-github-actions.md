# CI/CD with GitHub Actions

## What "CI/CD" means

- **CI (Continuous Integration)**: every time you push code, a remote machine (not your computer) downloads it, builds it, and checks that everything works — so a mistake doesn't slip through unnoticed.
- **CD (Continuous Deployment)**: if the build succeeds, that same pipeline automatically publishes the result online, without you having to do anything by hand (no "upload files via FTP").

**GitHub Actions** is GitHub's system for defining these pipelines: you describe them in a YAML file inside `.github/workflows/`, and GitHub runs them on a temporary virtual machine ("runner") whenever the event you specified happens (usually: a push).

## Our workflow, line by line

File: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

Triggers automatically on every push to the `main` branch. `workflow_dispatch` also adds a "Run workflow" button in the GitHub UI, so it can be launched manually when needed (e.g. to republish without having changed any code).

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

By default a workflow has minimal permissions. Here we only raise what's actually needed: read the repo's code, write to GitHub Pages, and generate an identity token (`id-token`) that GitHub uses to authenticate the deploy securely — no need to store passwords/secrets by hand.

```yaml
concurrency:
  group: pages
  cancel-in-progress: false
```

If you push twice in a row before the first deploy finishes, this prevents two publishes from overlapping and stepping on each other — they queue up instead of running in parallel.

### Job 1: `build`

```yaml
- uses: actions/checkout@v4
```

Downloads the repository's code onto the virtual machine (without this step, the runner is an empty machine — it doesn't have our code).

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
```

Installs Node.js 20 on the machine, and enables caching of npm dependencies between runs (subsequent builds are faster because they don't re-download every package from scratch).

```yaml
- run: npm ci
- run: npm run build
```

`npm ci` installs dependencies exactly as described in `package-lock.json` (more reliable than `npm install` in CI, because it never modifies the lockfile). `npm run build` runs `next build`, which — thanks to `output: 'export'` (see [`docs/04-static-export-github-pages.md`](./04-static-export-github-pages.md)) — generates the `out/` folder with the finished site.

```yaml
- uses: actions/configure-pages@v5
- uses: actions/upload-pages-artifact@v3
  with:
    path: ./out
```

`configure-pages` prepares the correct GitHub Pages settings. `upload-pages-artifact` **doesn't publish anything yet**: it packages the `out/` folder as an "artifact" — a temporary bundle of files, tied to this workflow run, that the next job can download and use.

### Job 2: `deploy`

```yaml
deploy:
  needs: build
  ...
  - uses: actions/deploy-pages@v4
```

`needs: build` means: "only run this job after `build` has finished successfully" — if the build fails (e.g. a TypeScript error), the deploy doesn't even start, so the live site stays on the previous working version instead of breaking. `deploy-pages` takes the artifact uploaded by the previous job and actually publishes it to GitHub Pages.

## Why two separate jobs instead of one

Splitting `build` and `deploy` isn't strictly necessary for a project this small, but it's the pattern GitHub officially recommends: the `deploy` job needs the special `id-token` permission to publish, while `build` doesn't — keeping them separate makes it clearer who does what, and makes it easy to add other checks later (tests, lint) to the `build` job without touching the publishing logic.

## Manual prerequisite (one-time, outside the code)

For this workflow to work, on GitHub, in the repository settings: **Settings → Pages → Source = "GitHub Actions"**.

Without this setting, GitHub Pages would try to publish from a branch (the old way, like `gh-pages`) instead of accepting the deploy from the pipeline.
