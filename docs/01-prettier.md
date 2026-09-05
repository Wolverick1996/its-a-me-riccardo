# Prettier

## What it does

Prettier is a code formatter: it reads a file and rewrites its whitespace, quotes, line breaks, etc. into one consistent style, removing the need to debate or manually enforce formatting by hand. It supports TypeScript/JavaScript, CSS, Markdown, YAML, and JSON, so one tool covers most of this repo's file types.

## How it's wired up here

- `.prettierrc.json` — the config. Currently just one setting: `"proseWrap": "never"`.
- `.prettierignore` — tells Prettier to skip `node_modules`, `.next`, `out` (all generated, not source), `package-lock.json` (managed by npm, not meant to be hand-formatted), and `.claude` (this machine's local Claude Code settings, unrelated to the project).
- `package.json` scripts: `npm run format` rewrites files in place; `npm run format:check` only reports what's non-conforming, without changing anything (useful in CI, or to check before committing).

## Why `proseWrap: "never"`

Prettier's default for prose (Markdown paragraphs, list items) is `"preserve"`: it leaves existing line breaks inside a paragraph exactly as they are, whatever they happen to be. `"never"` instead makes Prettier actively collapse every paragraph and list item down to a single line — matching the convention already used in the auto-generated Next.js block at the top of [`AGENTS.md`](../AGENTS.md) (see [`docs/00-agents-md-and-claude-md.md`](./00-agents-md-and-claude-md.md)): one logical line per paragraph, with the editor doing the visual wrapping instead of hard line breaks baked into the file. This keeps diffs clean too — editing one sentence in the middle of a hard-wrapped paragraph normally reflows every line after it, which shows up as a noisy diff even though only a few words changed; a single-line paragraph only ever changes on that one line.

## A gap Prettier doesn't cover: comments in code

Prettier deliberately does not reformat the _text_ inside comments (`//` or `/* */`) in TypeScript/JavaScript files — it will move a comment around if the code around it changes shape, but it won't rewrap or collapse the words inside it. So the "one line per comment block" convention for code comments (see the "Formatting" section in [`AGENTS.md`](../AGENTS.md)) is a manual house rule, not something `npm run format` enforces — it has to be kept by hand when writing or editing a comment.

## Try it

```
npm run format:check
```

reports any file that doesn't match the style (nothing to fix yet, right after a full `npm run format` run). Break the convention on purpose — hard-wrap a paragraph in a doc across two lines — and re-run the check to see Prettier flag it, then `npm run format` to see it collapsed back to one line automatically.
