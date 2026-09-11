"use client";

import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import type { AppDefinition } from "@/content/types";
import {
  desktopWorkArea,
  useWindowManagerStore,
} from "@/store/useWindowManagerStore";
import { animateWireframe, type Rect } from "@/lib/xpWireframeAnimation";

export default function Window({
  app,
  isFocused,
  onClose,
}: {
  app: AppDefinition;
  isFocused: boolean;
  onClose: (id: string) => void;
}) {
  const win = useWindowManagerStore((state) => state.windows[app.id]);
  const focusWindow = useWindowManagerStore((state) => state.focusWindow);
  const updateGeometry = useWindowManagerStore((state) => state.updateGeometry);
  const minimizeWindow = useWindowManagerStore((state) => state.minimizeWindow);
  const toggleMaximize = useWindowManagerStore((state) => state.toggleMaximize);

  // Whether the real window (as opposed to the wireframe standing in for it) is on screen right now. Classic Windows, XP included, never animates a real window's actual rendered content — only a plain 1px outline rectangle interpolates between two geometries, and the real window snaps in or out instantly at either end.
  const [visible, setVisible] = useState(true);
  const wasMinimizedRef = useRef(false);

  // Minimize/restore are triggered from more than one place (this window's own button, or its taskbar button toggling it), so this reacts to the store's isMinimized flag changing rather than to a specific click handler, covering both trigger paths the same way.
  useEffect(() => {
    if (!win) return;
    const wasMinimized = wasMinimizedRef.current;
    const isNowMinimized = win.isMinimized;
    wasMinimizedRef.current = isNowMinimized;
    if (wasMinimized === isNowMinimized) return;

    const shell = document.querySelector(".win-xp-shell");
    if (!shell) return;
    // The store never touches x/y/width/height on minimize, only isMinimized, so win's own geometry is still exactly right as both the minimize source and the restore target.
    const windowRect: Rect = {
      x: win.x,
      y: win.y,
      width: win.width,
      height: win.height,
    };
    // Falls back to animating in place (a no-op zero-distance wireframe) if the taskbar button isn't in the DOM yet — shouldn't happen once mounted, but a degenerate animation beats a missing one.
    const taskbarButton = document.querySelector(
      `[data-window-id="${app.id}"]`,
    );
    const taskbarRect = taskbarButton?.getBoundingClientRect() ?? windowRect;

    if (isNowMinimized) {
      void animateWireframe(windowRect, taskbarRect, shell);
      // Deferred one microtask so it still lands before the next paint (same as the restore branch's setVisible below) rather than synchronously in the effect body itself.
      void Promise.resolve().then(() => setVisible(false));
    } else {
      void animateWireframe(taskbarRect, windowRect, shell).then(() =>
        setVisible(true),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately keyed on isMinimized alone; re-running for every geometry change (drag/resize) would be wasted work, since geometry is only read here at the instant isMinimized flips.
  }, [win?.isMinimized, app.id]);

  function handleClose() {
    // No animation on purpose — real Windows closes a window with zero transition, wireframe or otherwise.
    onClose(app.id);
  }

  async function handleToggleMaximize() {
    if (!win) return;
    const shell = document.querySelector(".win-xp-shell");
    if (!shell) {
      toggleMaximize(app.id);
      return;
    }
    const fromRect: Rect = {
      x: win.x,
      y: win.y,
      width: win.width,
      height: win.height,
    };
    const toRect: Rect = win.isMaximized
      ? (win.restoreGeometry ?? fromRect)
      : desktopWorkArea();
    setVisible(false);
    await animateWireframe(fromRect, toRect, shell);
    toggleMaximize(app.id);
    setVisible(true);
  }

  // Guards a one-render gap between the store adding this id to openOrder and the same set() call's `windows` entry landing — shouldn't outlive that render in practice, but a real (if instantaneous) undefined beats a crash if the two ever did land in separate renders.
  if (!win) return null;

  return (
    <Rnd
      size={{ width: win.width, height: win.height }}
      position={{ x: win.x, y: win.y }}
      onDragStop={(_event, data) =>
        updateGeometry(app.id, { x: data.x, y: data.y })
      }
      onResizeStop={(_event, _direction, ref, _delta, position) =>
        updateGeometry(app.id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          ...position,
        })
      }
      dragHandleClassName="title-bar"
      disableDragging={win.isMaximized}
      enableResizing={!win.isMaximized}
      minWidth={200}
      minHeight={150}
      style={{ zIndex: win.zIndex }}
      onMouseDown={() => focusWindow(app.id)}
    >
      <div
        // `.window` (the chrome: background, bevel, border-radius) lives on this inner wrapper, not the Rnd box above — the Rnd box only owns position/size. `display: none` while a wireframe stands in for this window (minimizing/restoring/maximizing/restoring-down) is an instant, untransitioned toggle on purpose.
        className={`window-anim window${isFocused ? "" : " inactive"}`}
        style={{ display: visible ? undefined : "none" }}
      >
        <div className="title-bar">
          <div className="title-bar-title">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server */}
            <img src={app.desktopIcon} alt="" className="title-bar-icon" />
            <div className="title-bar-text">{app.title}</div>
          </div>
          <div className="title-bar-controls">
            <button
              aria-label="Minimize"
              onClick={() => minimizeWindow(app.id)}
            ></button>
            <button
              aria-label={win.isMaximized ? "Restore" : "Maximize"}
              onClick={handleToggleMaximize}
            ></button>
            <button aria-label="Close" onClick={handleClose}></button>
          </div>
        </div>
        <div className="window-body">
          <p>{app.title} — content coming in a later step.</p>
        </div>
      </div>
    </Rnd>
  );
}
