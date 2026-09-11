# Verifying visual and behavioral fidelity, instead of eyeballing it

A recurring practice across this project, not tied to one file: whenever a change is supposed to make something look or behave a specific way — match a real XP screenshot, fix a hover state, animate correctly — that claim gets checked against a real, running instance of the page, not just read off the code or judged by eye. Two tools cover two different kinds of claim.

## Static pixel colors: Pillow

For "does this CSS value match real XP," a real screenshot of Windows XP is the source of truth, checked with [Pillow](https://pillow.readthedocs.io/), a Python image-processing library:

```python
from PIL import Image
im = Image.open("screenshot.png")
im.getpixel((x, y))  # exact RGB at one point
im.crop((x0, y0, x1, y1))  # cut out a region to inspect further
```

This is how the taskbar gradient, title-bar colors, and icon-grid spacing in [`desktop-shell.css`](../src/styles/desktop/desktop-shell.css) were pinned down — see [docs/09-desktop-shell-lessons.md](./09-desktop-shell-lessons.md). It only works on a real file on disk, not an image pasted into chat, since reading exact pixels needs the actual file bytes, not a rendering of them.

## Interactive/dynamic behavior: Playwright

Pillow answers "what color is this pixel," but most of this shell's bugs weren't about color — they were about _state_: what does the Close button look like while the mouse is held down, does the window's `box-shadow` actually change on `:active`, does a minimize animation actually reach the taskbar button. Answering those needs a real browser actually running the page, which is what [Playwright](https://playwright.dev/) is for. It's never a project dependency — installed transiently (`npm install playwright --no-save`, or reused if already present) for one investigation, then removed — since this project has no real test suite yet; these are one-off verification scripts, written to a throwaway `.mjs` file and deleted once the question they were written to answer is settled, not code that lives in the repo.

Three recipes cover most of what came up:

**Computed-style inspection** — for "which CSS rule is actually winning," don't guess from specificity on paper, read what the browser resolved:

```js
const styles = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Close"]');
  const cs = getComputedStyle(btn);
  return { boxShadow: cs.boxShadow, filter: cs.filter };
});
```

When the computed value doesn't match any of the rules that look like they should apply, the fix is to stop guessing and dump every matching rule from `document.styleSheets` instead, in source order, and compare their declarations directly — the actual winner (often a vendored rule with a broader selector or its own `!important`) turns up in the list, rather than in a specificity calculation done on paper.

**Screenshot diffing** — for "is this `!important` actually load-bearing," a baseline screenshot of every interactive state (hover, active, focus, `aria-pressed`, inactive window, …) compared byte-for-byte against the same states with the flag removed:

```python
from PIL import Image, ImageChops
diff = ImageChops.difference(Image.open("baseline.png"), Image.open("test.png"))
diff.getbbox()  # None if the two images are pixel-identical
```

This is how a suspicious `!important` (or any other rule that looks redundant) gets confirmed one way or the other — by evidence, not by removing it and hoping nothing looked different.

**Frame-by-frame instrumentation** — a single before/after screenshot can't catch a bug that only exists mid-transition, like the restore-animation flash documented in [docs/10-window-manager-state.md](./10-window-manager-state.md). Logging computed style on every animation frame exposes what a screenshot can't:

```js
function logFrames(n) {
  if (n <= 0) return;
  requestAnimationFrame(() => {
    console.log(getComputedStyle(el).opacity);
    logFrames(n - 1);
  });
}
```

## A practical gotcha: retry clicks

Playwright's actionability checks (is the element visible, stable, unobscured) occasionally time out under system load even when the element is provably clickable at that exact moment — confirmed by cross-checking `document.elementFromPoint()` against the click target when it happened. Wrapping clicks in a short retry loop resolved this without it ever turning out to be a real application bug:

```js
async function clickRetry(locator, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try {
      await locator.click({ timeout: 3000 });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error("click never succeeded");
}
```
