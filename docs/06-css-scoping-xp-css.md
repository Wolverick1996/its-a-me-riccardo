# Scoping a third-party CSS library: XP.css

## The problem: a library that styles bare HTML elements

[XP.css](https://botoxparty.github.io/XP.css/) is a small CSS library that recreates the Windows XP "Luna" look for plain HTML: `button`, `select`, `fieldset`, even `body` itself get styled the moment the stylesheet is loaded, with no class required. That's fine for a page with only one visual style, but this site also renders a completely different visual world (the Nokia 3310 mobile shell) on the same page load (see [`docs/03-nextjs-concepts.md`](./03-nextjs-concepts.md) on why both shells stay mounted in the DOM at once). Left as-is, XP.css's bare-element rules would apply everywhere, making every `<button>` on the site — Nokia included — look like a Windows XP button.

## The fix: prefix every selector with an ancestor class

A library that doesn't support scoping itself can still be scoped from the outside: rewrite every selector to require an ancestor class, once, on the compiled CSS. `body{...}` becomes `.win-xp-shell{...}`, `button{...}` becomes `.win-xp-shell button{...}`, and so on. As long as the real root element carries that class, none of these rules can match anything outside it.

This was done with [`postcss`](https://postcss.org/) and the [`postcss-prefix-selector`](https://www.npmjs.com/package/postcss-prefix-selector) plugin, run once against the library's compiled CSS via a throwaway script — both packages were installed with `--no-save` and uninstalled again right after. The result, [`src/styles/desktop/XP-scoped.css`](../src/styles/desktop/XP-scoped.css), is what actually ships; from here on it's just a regular (if large, minified) CSS file, hand-editable like any other, with no build step to re-run.

## A CSS parser can reject selectors that used to just work

The generated file initially failed to compile, with Next.js's dev server (Turbopack) reporting:

```
Error: Parsing CSS source code failed
Pseudo-elements like '::before' or '::after' can't be followed by selectors like 'SquareBracketBlock'
```

The cause was already present in XP.css's own output, not introduced by the prefixing step: selectors like `progress:not([value]):after:not([value])` place a pseudo-class (`:not(...)`) _after_ a pseudo-element (`:after`). Older, looser CSS parsers tolerated that ordering; Turbopack's stricter one doesn't, and rejects the _entire_ stylesheet over a single invalid selector anywhere in it. This is a concrete instance of the general warning in [`AGENTS.md`](../AGENTS.md)'s banner: a newer toolchain version can enforce rules an older one — or a human's assumptions — let slide. The fix was mechanical: each broken selector was one half of a comma-separated pair whose other half (the same selector, minus the trailing `:not(...)`) was already valid and equivalent, so the invalid half was simply dropped.

## Relative paths inside a moved file still need to resolve

XP.css's `@font-face` rules reference their font files with bare relative paths (`url(ms_sans_serif.woff)`), which only resolve if the font sits in the same folder as the CSS file referencing it. The fonts ended up in a `fonts/` subfolder for tidiness ([`src/styles/desktop/fonts/`](../src/styles/desktop/fonts/)), which silently broke every `url()` until they were rewritten to `url(fonts/ms_sans_serif.woff)` to match — a reminder that moving a vendored file doesn't move what it points to.

Both of the above were only caught by actually rendering the page and checking the browser console/build output, not by reading the CSS — see the "for UI changes, verify in a real browser" habit this project tries to follow throughout.
