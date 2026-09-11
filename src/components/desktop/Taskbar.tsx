"use client";

import { useEffect, useState } from "react";
import type { AppDefinition } from "@/content/types";

function Clock() {
  // Starts empty and fills in after mount, on purpose: the server has no notion of "now" for a statically prerendered page, so rendering a real time during the initial render would mismatch the browser's first paint.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const id = setInterval(update, 1000 * 10);
    return () => clearInterval(id);
  }, []);

  return <div className="taskbar-clock">{time ?? " "}</div>;
}

export default function Taskbar({
  openApps,
  focusedId,
  startMenuOpen,
  onToggleStart,
  onSelectWindow,
}: {
  openApps: AppDefinition[];
  focusedId: string | null;
  startMenuOpen: boolean;
  onToggleStart: () => void;
  onSelectWindow: (id: string) => void;
}) {
  return (
    <div className="taskbar">
      <button
        type="button"
        className="start-button"
        aria-label="Start"
        aria-expanded={startMenuOpen}
        onClick={(event) => {
          // Stop the click from bubbling to Desktop's "click outside closes the start menu" handler, which would immediately undo the toggle below (child handlers run before parent ones bubble).
          event.stopPropagation();
          onToggleStart();
        }}
      />
      {/* The button's whole face — icon, "start" text, shape, and neutral/hover/pressed color states — is a real cropped screenshot, not hand-drawn, so there's no visible text child here; aria-label carries the accessible name instead. */}
      {openApps.map((app) => (
        <button
          key={app.id}
          type="button"
          className="taskbar-window-button"
          aria-pressed={app.id === focusedId}
          onClick={() => onSelectWindow(app.id)}
          // Lets a Window locate its own taskbar button (getBoundingClientRect) to animate minimize/restore toward/from it.
          data-window-id={app.id}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server. */}
          <img
            src={app.desktopIcon}
            alt=""
            className="taskbar-window-button-icon"
          />
          <span className="taskbar-window-button-label">{app.title}</span>
        </button>
      ))}
      <Clock />
    </div>
  );
}
