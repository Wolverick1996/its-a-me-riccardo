# Lessons from building the Desktop XP shell

A short list of genuinely reusable takeaways from getting [`desktop-shell.css`](../src/styles/desktop/desktop-shell.css) and its window/taskbar chrome to look authentic — not a record of every attempt along the way, just what's actually worth carrying into future work.

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
