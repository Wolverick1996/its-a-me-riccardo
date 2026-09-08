# Scaling the Desktop XP shell to look period-accurate at any screen size

## The problem isn't device pixel density — it's viewport size

The first instinct when a `30px` taskbar looks tiny on a big modern monitor is "adapt to the screen's DPI." That's not actually the lever available here: CSS `1px` is a _reference pixel_ (the visual angle of 1/96 inch at arm's length), a perceptual unit, not a literal dot — so a `30px` element is already specified to _look_ the same size whether the display packs 1 physical pixel into it (a 2001 96 DPI CRT) or 4+ (a modern Retina screen). `devicePixelRatio` exposes that packing ratio for cases like keeping a `<canvas>` bitmap crisp, but ordinary CSS layout never needs it — the browser already does that translation beneath the `px` values this project writes. There's also no API exposing a monitor's true physical DPI, so "detect the DPI and multiply" isn't a lever a page could pull even if it wanted to.

The actual mismatch is about **viewport size, not pixel density**: Windows XP's most common desktop resolution was 1024×768. A 30px-tall taskbar was always meant to occupy `30/768 ≈ 3.9%` of the screen's height. Rendered at a literal, fixed `30px` inside a much taller modern browser window, it still occupies only those same 30 physical pixels — a much smaller _fraction_ of the available height than it ever was on a 1024×768 screen, because it was never designed to share a canvas that large.

## The fix: one scale factor, anchored to the 1024×768 reference

[`src/styles/desktop/desktop-shell.css`](../src/styles/desktop/desktop-shell.css) defines one custom property on `.win-xp-shell`:

```css
.win-xp-shell {
  --xp-scale: calc(100vh / 768);
}
```

Every length in that file is written as `calc(<original 1024x768 px value> * var(--xp-scale))` instead of a plain px value — e.g. the taskbar's `height: 30px` becomes `height: calc(30 * var(--xp-scale))`. At a 768px-tall viewport `--xp-scale` is exactly `1`, so that's still `30px`; at a typical 1920×1080 window, `--xp-scale ≈ 1.406`, so the taskbar renders at `≈42px` — still `42 / 1080 ≈ 3.9%` of the window's height, the same fraction the reference design used, just physically bigger. Verified directly by comparing the taskbar's rendered height at two viewport heights and confirming an exact ratio, not an approximation.

Anchoring on _height_ specifically matters for every scaled element, not just the taskbar. The same factor multiplies both dimensions of everything, so a 75×75 icon cell or a 21×21 button stays square regardless of which axis it's anchored on — the anchor doesn't touch any element's own proportions. What it decides is which dimension's _fit against the viewport_ is preserved. This shell's chrome stacks vertically (taskbar, icon grid rows, cascaded windows), all sized relative to the reference's `768px` height, not its `1024px` width — so height is the dimension that has to track the reference for that stack to keep fitting the way it did originally, on windows far wider or narrower than 4:3. Anchoring on width instead would get a wide-but-short window backwards, scaling everything up as if there were room when the real constraint (vertical space) says otherwise.

Custom properties inherit down the DOM by default, so every descendant of `.win-xp-shell` (icons, taskbar, start menu, windows) can reference `var(--xp-scale)` without redeclaring it.

## What this covers, and what it deliberately doesn't

Scaled: everything in `desktop-shell.css` (the hand-authored chrome — taskbar, start button, start menu, desktop icon grid, the title-bar padding override), plus each window's instance size and cascade offset, set inline in [`src/components/desktop/Window.tsx`](../src/components/desktop/Window.tsx) using the same `var(--xp-scale)` via a CSS `calc()` string (there's no JavaScript reading `window.innerHeight` anywhere — it's pure CSS, so it re-computes on resize for free, no listener needed). Icon images that used to carry fixed `width`/`height` HTML attributes now use CSS classes (`.desktop-icon-image`, `.title-bar-icon`, etc.) sized the same way, so nothing in the shell is pinned to a literal px number anymore.

Deliberately left unscaled: the vendored [`XP-scoped.css`](../src/styles/desktop/XP-scoped.css)'s own internal widget dimensions (window-body margins, form control sizing, borders) — retrofitting `calc()` scaling across a 260KB vendored file for comparatively minor details was judged out of proportion to the benefit. The one exception is the title-bar control buttons (minimize/maximize/close): their box size is overridden to scale too, since otherwise they'd look increasingly undersized next to an increasingly larger title bar. Doing that safely needed one extra property XP-scoped.css never sets — `background-size: contain` — since without it, a resized button box leaves its (fixed-size) icon glyph pinned at the button's original native size instead of scaling with it.

## Where the reference numbers came from

Not guessed — each was checked against a real source before use:

- **Taskbar/title bar height (30px)**: the well-established default Windows taskbar height.
- **Desktop icon grid cell (75×75px)**: the default `IconSpacing`/`IconVerticalSpacing` registry values (`HKCU\Control Panel\Desktop\WindowMetrics`), both `-1125` twips — an old Win32 unit, 1/1440 inch. At 96 DPI that's `96/1440 = 1/15` px per twip, so `1125` twips is `75px`.
- **Title-bar control buttons (21×21px)**: not a metric lookup — read directly out of the button's own embedded SVG icon backgrounds in XP-scoped.css (`viewBox="0 -0.5 21 21"`), which is the actual size the library's artwork was drawn at.
