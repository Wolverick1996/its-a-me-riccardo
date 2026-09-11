// Classic (pre-DWM) Windows, XP included, had no way to smoothly animate a real window's rendered content — minimize, restore, maximize, and restore-down were all instead faked with a plain 1px outline rectangle interpolating between the two geometries, with the real window snapping in or out instantly at either end.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function applyRect(el: HTMLElement, rect: Rect) {
  el.style.left = `${rect.x}px`;
  el.style.top = `${rect.y}px`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}

// Resolves once the wireframe has reached `to` and been removed. The container should be the `.win-xp-shell` root, so the wireframe is scoped under the same selector as the rest of the shell's CSS and sits inside the stacking context its z-index is relative to.
export function animateWireframe(
  from: Rect,
  to: Rect,
  container: Element,
): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement("div");
    el.className = "xp-wireframe";
    applyRect(el, from);
    container.appendChild(el);
    // Forces the browser to paint `from` before `to` is applied below — without this the two writes coalesce into one and there's nothing for the CSS transition to interpolate between.
    el.getBoundingClientRect();

    const cleanup = () => {
      el.remove();
      resolve();
    };
    el.addEventListener("transitionend", cleanup, { once: true });
    // Belt-and-braces fallback: a `from` equal to `to` (nothing to interpolate) never fires `transitionend` at all.
    const fallback = setTimeout(cleanup, 220);
    el.addEventListener("transitionend", () => clearTimeout(fallback), {
      once: true,
    });

    requestAnimationFrame(() => applyRect(el, to));
  });
}
