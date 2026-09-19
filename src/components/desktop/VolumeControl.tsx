"use client";

import { useEffect, useRef, useState } from "react";
import { useVolumeStore } from "@/store/useVolumeStore";

// Reproduces the real XP tray volume flyout — a titleless beveled box holding a "Volume" label, a vertical slider, and a Mute checkbox that disables the slider without resetting its position, same as real XP. Volume/mute themselves live in useVolumeStore, not local state, so a real <audio> element elsewhere on the desktop can actually be driven by this control rather than it staying purely decorative.
// The flyout's own width in the same reference units its CSS `width: calc(68 * var(--xp-scale))` uses — read here too so opening it can check whether it actually fits before committing to a side.
const FLYOUT_WIDTH_REF_PX = 68;

export default function VolumeControl() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"right" | "left">("right");
  const volume = useVolumeStore((state) => state.volume);
  const setVolume = useVolumeStore((state) => state.setVolume);
  const muted = useVolumeStore((state) => state.muted);
  const setMuted = useVolumeStore((state) => state.setMuted);
  const rootRef = useRef<HTMLDivElement>(null);

  // Closes on any click outside this component, same pattern as the desktop icon marquee/StartMenu use elsewhere — listens on document rather than relying on blur, since a click on the tray icon itself (which toggles `open`) shouldn't immediately be treated as "outside".
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Only computes a side when actually opening — closing doesn't need it, and re-deciding on every render (rather than once per open) would flip the box mid-interaction if the window happened to resize while it's open.
  function handleToggle() {
    setOpen((wasOpen) => {
      const willOpen = !wasOpen;
      if (willOpen && rootRef.current) {
        // Same formula as desktop-shell.css's own `--xp-scale: calc(100vh / 768)` — duplicated rather than read back via getComputedStyle, because a CSS custom property's computed value is its literal specified text ("calc(100vh / 768)"), not a resolved number; only a *used* property (e.g. an element's actual width) resolves the calc(), and there's no such element handy here to measure instead.
        const scale = window.innerHeight / 768;
        // .taskbar-tray-volume is exactly as wide as the icon button it wraps, so its rect gives the icon's horizontal center directly.
        const flyoutWidth = FLYOUT_WIDTH_REF_PX * scale;
        const iconCenterX =
          rootRef.current.getBoundingClientRect().left +
          rootRef.current.getBoundingClientRect().width / 2;
        setPlacement(
          iconCenterX + flyoutWidth <= window.innerWidth ? "right" : "left",
        );
      }
      return willOpen;
    });
  }

  return (
    <div className="taskbar-tray-volume" ref={rootRef}>
      <button
        type="button"
        className="taskbar-tray-icon-button"
        aria-label="Volume"
        aria-expanded={open}
        onClick={handleToggle}
      >
        <img
          src={muted ? "/icons/desktop/Mute.png" : "/icons/desktop/Volume.png"}
          alt=""
          className="taskbar-tray-icon"
        />
      </button>
      {open && (
        <div className={`volume-flyout volume-flyout-${placement}`}>
          <div className="window-body volume-flyout-body">
            <span>Volume</span>
            <div className="is-vertical">
              <input
                type="range"
                className="has-box-indicator"
                min={0}
                max={100}
                value={volume}
                disabled={muted}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume level"
              />
            </div>
            <div className="field-row">
              <input
                id="volume-mute"
                type="checkbox"
                checked={muted}
                onChange={(event) => setMuted(event.target.checked)}
              />
              <label htmlFor="volume-mute">Mute</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
