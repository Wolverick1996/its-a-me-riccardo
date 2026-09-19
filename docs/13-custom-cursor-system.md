# Building a custom-cursor system out of real Windows cursor files

How [`src/styles/desktop/cursors.css`](../src/styles/desktop/cursors.css), [`public/cursors/`](../public/cursors/), and [`src/store/useCursorStore.ts`](../src/store/useCursorStore.ts) replace the host OS's own mouse pointer with real Windows cursor artwork throughout the Desktop XP shell — and the two non-obvious problems that came with it.

## Gotchas worth remembering beyond cursors

- An image library can silently mishandle an old format instead of erroring. Pillow decodes a `.cur` file's artwork fine but drops its legacy transparency mask without warning, turning "transparent" into solid black — worth eyeballing a decoded image rather than trusting that no error means it decoded correctly.
- A cursor's hotspot is the pixel in its image that CSS treats as "this is where the pointer actually is" — set via `cursor: url(image.png) x y`, with `x y` measured in pixels from the image's top-left corner. That coordinate is into the image's full canvas, not into its visible artwork, so cropping padding off the image means moving the hotspot number too, or clicks land visibly off the pointer's tip.
- The OS may already render an effect you're about to bake into the asset yourself. None of these source images carry a drop shadow, yet the on-screen cursor still shows one — macOS adds a soft shadow under any custom cursor image regardless of what the image contains. Baking a shadow into the artwork on top of that just stacks a second, harder-edged shadow underneath the OS's own.
- Some elements override an inherited CSS property instead of inheriting it. A `<button>`'s own default and `react-rnd`'s inline style both did this for `cursor`, and needed `cursor: inherit` spelled out explicitly (more in [docs/09-desktop-shell-lessons.md](./09-desktop-shell-lessons.md#a-specified-value-always-beats-an-inherited-one-however-deep-the-ancestor-sits)).

## A component-local `useState` doesn't survive being handed off to another component

Some UI state is set by one component but has to be read, and eventually cleared, by a different one that mounts later — `useState` disappears the moment its own component unmounts, so it can't carry a hand-off like that. A store living outside any single component's lifecycle can.

That's what `useCursorStore` (a one-field Zustand store, same pattern as `useSessionStore`/`useVolumeStore`) is for here: the "AppStarting" cursor starts on `LoginScreen`'s account-tile click but keeps showing through `WelcomeScreen` and into `Desktop` — three top-level screens that `software/page.tsx` swaps in one at a time. Each screen reads the store, and whichever one's own loading actually finishes — the startup chime ending, or `ShutdownScreen` mounting — clears it.
