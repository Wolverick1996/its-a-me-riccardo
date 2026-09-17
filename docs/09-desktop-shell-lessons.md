# Lessons from building the Desktop XP shell

A short list of genuinely reusable takeaways from getting this project's XP-styled CSS — [`desktop-shell.css`](../src/styles/desktop/desktop-shell.css) and its window/taskbar chrome, [`login-screen.css`](../src/styles/desktop/login-screen.css) and friends — to look authentic. Not a record of every attempt along the way, just what's actually worth carrying into future work.

## Measure against a real reference, don't guess from memory

Every color, gradient, spacing, and radius meant to mimic real XP was checked against an actual screenshot rather than eyeballed from memory — early guesses were consistently, measurably off once checked this way. See [docs/07-verifying-ui-fidelity.md](./07-verifying-ui-fidelity.md) for how.

## Prefer a real asset over a parametric approximation for complex, hand-drawn visuals

XP's Start button has its own baked-in lighting and an asymmetric shape — a rounded left cap, a tapered right point — that a CSS reconstruction (gradients, `clip-path`, `filter: drop-shadow`) could only ever approximate, however many rounds of tuning it went through. It's a real cropped image now (`public/start-button/{neutral,hover,click}.png`), not CSS. When something wasn't drawn with simple shapes to begin with, it's worth knowing when to stop trying to reproduce it in code and just use the real asset.

## `position: absolute` always paints after a `position: static` sibling, regardless of DOM order

An easy trap: an absolutely-positioned element renders on top of an in-flow sibling even if that sibling appears later in the markup.

```html
<div class="overlay">I'm positioned, and first in the markup</div>
<div class="content">I'm static, and later — but still underneath</div>
```

```css
.overlay {
  position: absolute;
  inset: 0;
}
.content {
  position: static;
}
```

Positioned elements always paint above in-flow ones, regardless of source order — DOM order only decides paint order _within_ a stacking context, not between a positioned element and a static one. This is what caused the window's decorative bevel overlay to briefly paint over the title bar, despite the title bar being written later in the DOM.

## Two CSS rules at equal specificity: the later one silently wins

```css
.a {
  position: relative;
}
.b {
  position: absolute;
}
```

If some element has both classes `a` and `b`, it ends up `position: absolute` — not because `.b` is "more specific" (both are single class selectors, equally specific), but simply because `.b` is declared later in the file. Swap the order and the element's position changes with it, with no error or warning either way. `Window.tsx` once put both `.window` and a now-removed `.desktop-window` class on the same div, each with its own conflicting `position` rule, and exactly this collision broke the window's positioning until the redundant rule was found and deleted. Worth remembering whenever the same element carries more than one class with overlapping rules.

## An element+class selector always outranks a bare class, whatever the source order

```css
.win-xp-shell button {
  background: none !important;
}
.custom-button {
  background: none; /* loses anyway */
}
```

`.win-xp-shell button` (one class + one element) is more specific than `.custom-button` (one class alone), even when the latter is declared later in the stylesheet — source order only breaks ties between selectors of _equal_ specificity (the previous lesson), never overrides a genuinely more specific one. The fix for a custom element caught by a broader vendored reset like this is to join the more specific chain (`.win-xp-shell .custom-button`, two classes) rather than fight it with declaration order.

## `calc()` needs a plain number on at least one side — and fails silently

```css
/* invalid: both sides are lengths, not a length times a number */
width: calc(100px * var(--scale));

/* valid: the reference value is a bare number */
width: calc(100 * var(--scale));
```

If `--scale` itself resolves to a length (e.g. `calc(100vh / 768)`), multiplying it by another length isn't dimensionally a length at all, so the browser rejects the whole declaration as invalid — and the property doesn't warn or fall back to some sane value, it resets to its own initial value (`width: auto` for an `<img>`, for instance). An image whose intrinsic size is declared in physical units (e.g. `width="256mm"`, resolved against 96dpi) can then render hundreds of pixels wide with no visible error anywhere, which is what makes this worth watching for: the bug looks like a sizing mistake, not a rejected declaration.

## Flexbox's `min-width: auto` default blocks shrinking of anything with content

A very common gotcha: flex items default to `min-width: auto`, meaning "never shrink narrower than your unwrapped content" — a floor that silently defeats `flex-shrink` on anything containing text.

```css
.tile {
  flex: 1 1 160px; /* "please shrink if the row gets too narrow" */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

However narrow the flex row gets, a `.tile` with a text label won't shrink past that label's full unwrapped width — `flex: 1 1 160px` is ignored below that point, and the tile just overflows its row instead. Adding `min-width: 0` removes that invisible floor and lets `flex-shrink` (and `text-overflow: ellipsis`) actually do their job. This is what let the taskbar's open-window tiles actually shrink together instead of overflowing.

## Padding on a `flex: 1 1 0` item breaks the equal split it's supposed to guarantee

```css
.panel {
  flex: 1 1 0; /* "split remaining space exactly evenly" */
}
.panel--left {
  padding-right: 6px;
}
.panel--right {
  padding-left: 37px; /* breaks the even split above */
}
```

`flex: 1 1 0` is shorthand for three properties, in order:

- `flex-grow: 1` — how much this item grows relative to its siblings to absorb any leftover space in the container.
- `flex-shrink: 1` — the same idea in reverse: how much it shrinks relative to its siblings when the container is too small to fit them at their natural size.
- `flex-basis: 0` — the item's starting size before grow/shrink apply, overriding the default `auto` ("use the content's natural size"). Starting at `0` means content no longer affects any item's starting size at all, so the container's entire width counts as leftover space to divide by `flex-grow` — equal `flex-grow` values then split it exactly in half, regardless of content.

That `flex-basis: 0` is also why padding is the trap: padding on the item itself adds directly on top of that `0` in the final size calculation, breaking the parity between siblings whose padding doesn't match — while a margin on the item's own child never touches the flex item's own box model, so it can't interfere with that calculation the same way. That's the fix: move the spacing that needs to hug a shared edge to a margin on the item's child, not to padding on the item itself.
