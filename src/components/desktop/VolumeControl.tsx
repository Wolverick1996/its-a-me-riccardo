"use client";

import { useEffect, useRef, useState } from "react";
import { useVolumeStore } from "@/store/useVolumeStore";

// Reproduces the real XP tray volume flyout — a titleless beveled box holding a "Volume" label, a vertical slider, and a Mute checkbox that disables the slider without resetting its position, same as real XP. Volume/mute themselves live in useVolumeStore, not local state, so a real <audio> element elsewhere on the desktop can actually be driven by this control rather than it staying purely decorative.
export default function VolumeControl() {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="taskbar-tray-volume" ref={rootRef}>
      <button
        type="button"
        className="taskbar-tray-icon-button"
        aria-label="Volume"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server. */}
        <img
          src={muted ? "/icons/desktop/Mute.png" : "/icons/desktop/Volume.png"}
          alt=""
          className="taskbar-tray-icon"
        />
      </button>
      {open && (
        <div className="volume-flyout">
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
