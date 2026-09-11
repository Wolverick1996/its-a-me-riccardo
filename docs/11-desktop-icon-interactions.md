# Desktop icon grid: selection and drag-and-drop

[`Desktop.tsx`](../src/components/desktop/Desktop.tsx) and [`DesktopIcon.tsx`](../src/components/desktop/DesktopIcon.tsx) implement a rubber-band marquee for multi-selecting icons and drag-and-drop for repositioning them within the grid.

## Rubber-band selection is a live intersection test, not a one-shot check

"Rubber-band" (or marquee) selection is the classic click-and-drag-a-rectangle-over-things gesture. The naive way to build it only computes the selection once, on `mouseup`. That's not what makes it feel right, though — real XP lights icons up live as the rectangle sweeps over them, and dims them again the instant it moves past, well before the mouse is released.

That means re-running the test on every `mousemove`, not just once at the end. The test itself is a plain **AABB (axis-aligned bounding box) intersection check**: read every icon's real `getBoundingClientRect()` and compare it against the marquee's current bounds — two axis-aligned rectangles overlap exactly when they overlap on the X axis _and_ the Y axis independently, so it's just two 1-D overlap tests. Re-deriving the whole selection this way from real DOM measurements, every frame, rather than incrementally tracking what changed, is what makes the live sweep-to-select behavior fall out for free.

Both this and the icon drag below listen on `window` rather than the desktop's own div, for the same reason [docs/10-window-manager-state.md](./10-window-manager-state.md)'s window-animation code does: a fast drag can pass over other elements (another icon, an open window, the taskbar) that would otherwise swallow a bubbling `mousemove`, or the pointer can outrun the container's own bounds entirely.

## Why not `IntersectionObserver`

`IntersectionObserver` looks like the obvious tool for "which elements overlap this rectangle", but it doesn't fit this gesture, for two independent reasons. First, its `root` — the rectangle intersection is measured against — is fixed at construction time and can never be updated afterward; the marquee's rectangle is exactly the opposite, changing on every `mousemove`, so using it would mean tearing down and recreating the observer on every pointer move, which is more machinery than just measuring rects directly. Second, `IntersectionObserver` callbacks are asynchronous and batched by the browser around its own rendering schedule, not run synchronously inside the event that triggered them — fine for its actual use cases (lazy-loading images, infinite scroll, ad visibility) where a frame or two of lag is invisible, but wrong here, where the live sweep-to-select effect depends on the selection updating in the same tick as the rectangle it's drawn from. A handful of icons measured with `getBoundingClientRect()` on every `mousemove` (the approach above) is both simpler and actually synchronous.

## A custom drag has to actively suppress the browser's own default gestures

A `mousedown` followed by dragging is, by default, the browser's own text-selection gesture, and an `<img>` is draggable via the native HTML5 drag-and-drop API — both run _alongside_ a hand-rolled drag unless stopped, not instead of it. Left alone, the first highlights icon labels in the browser's own selection color, clashing with this shell's own `.selected` styling; the second can silently swap `mousemove` for the browser's own `drag`/`dragover` events mid-drag, stranding this shell's own drag state with nothing left to update it. Fixed with `event.preventDefault()` on the marquee's `mousedown` (plus `user-select: none` as a CSS backstop) and `draggable={false}` on the icon's `<img>`.

## A drag that ends where it started still fires a trailing `click`

`mouseup` and `click` aren't the same event — `click` fires afterward, on whatever's under the cursor, which is still the dragged element if the drag never visually left it (true here: dragging moves an icon via a CSS transform, so the cursor is still over it on release). That matters because `Desktop.tsx`'s own `click` handler clears the selection, same as clicking empty desktop does in real XP — left alone, that trailing `click` would immediately undo the selection a completed drag just made. A ref, set once a drag crosses the movement threshold and cleared the first time the `click` handler sees it, consumes exactly that one `click`. The same pattern covers both the marquee (`didDragRef`) and icon dragging (`didDragIconRef`).

## Never trust a single `mouseup` to end a drag

The mouse button can be released somewhere this page never sees — over another app, off-screen — with no `mouseup` ever reaching it, leaving a `mouseup`-only drag implementation permanently "armed": every later `mousemove`, button held or not, keeps dragging the element along.

The fix relies on `event.buttons` instead: unlike `mouseup` (an event that fires once, only if the release actually happens where this page can see it), `event.buttons` is a bitmask every mouse event carries, reporting which buttons are physically held down _at that instant_ (`1` for the primary button, `0` for none). Every `mousemove` handler checks it and ends the drag the moment it reads `0` — a live, continuously-available fact rather than a one-shot signal that can simply never arrive.

## `getComputedStyle` doesn't resolve custom properties

Reading a CSS custom property (`--icon-cell`) back out via `getComputedStyle` returns its literal specified value as text — `calc(75 * var(--xp-scale))` — not a resolved pixel number. A _standard_ property like `padding-left` resolves fully, calc() and all, because the browser actually computes standard properties for layout; a custom property is just a variable, never "computed" the same way. The fix is to skip the property lookup and measure a real rendered element's own `getBoundingClientRect()` instead — always the true, resolved size.

## Clamping a grouped drag once, not per member

Dragging one selected icon among several moves the whole selection together, sharing a single `(col, row)` offset applied to every member on drop. Clamping that offset to the grid's bounds has to happen once, for the group as a whole — clamping each icon's position independently would let the group silently compress or reshape the moment any one member hit an edge while the others kept moving. So the tightest bound across the whole group is computed first (whichever member is closest to an edge limits how far the whole group can go), then that one clamped offset is applied uniformly — the group moves or stops as a unit, never partially.

If the drop's target cell is already held by an icon outside the group, the whole move is rejected: everything snaps back to where it started, no swapping, no displacing what was there. Worth flagging honestly: this isn't a verified reproduction of real XP — research confirmed "Align icons to grid" prevents overlap in general, but turned up nothing on what happens specifically when a drop targets an occupied cell. Reject-and-snap-back was chosen as the predictable behavior once no source could settle it either way.

## Stretching a reference-based grid to fill available space without a gap

Real Windows' 75px icon spacing doesn't divide evenly into the space available for the grid: `768` (reference height) `− 30` (taskbar) `− 16` (grid padding) `= 722`px usable, and `722 / 75 ≈ 9.6` — so 9 rows fit, with about two-thirds of a row (≈47px) left over above the taskbar. Accurate to a real XP desktop at that resolution — but this shell's scaling philosophy ([docs/08-dpi-scaling.md](./08-dpi-scaling.md)) uses exactly the share of the screen real XP gave every piece of chrome, so an unfilled gap here reads as the grid running out of rows, not as a deliberate margin.

The fix stretches only the axis with a fixed count. Columns keep the literal 75px-equivalent value — there's no fixed column count to divide evenly, `grid-auto-flow` just adds more as needed. Row height instead becomes `722 / 9` (≈80.2px-equivalent) rather than the literal 75, so the same 9 rows tile the available height exactly. Because every number in that math scales through the same `--xp-scale` factor as everything else, the fill stays exact at any real viewport height, not just the 768px reference one.
