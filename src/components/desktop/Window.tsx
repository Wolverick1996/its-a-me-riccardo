"use client";

import type { AppDefinition } from "@/content/types";

export default function Window({
  app,
  cascade,
  isFocused,
  onFocus,
  onClose,
}: {
  app: AppDefinition;
  cascade: number;
  isFocused: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
}) {
  // Staggers overlapping windows diagonally (real cascade behavior) since there's no drag yet — 24 reference px per step, scaled like the rest of the shell.
  const scaledOffset = `(${cascade} * 24 * var(--xp-scale))`;

  return (
    <div
      className={`desktop-window window${isFocused ? "" : " inactive"}`}
      onMouseDown={() => onFocus(app.id)}
      style={{
        width: `calc(${app.defaultWindowSize.width} * var(--xp-scale))`,
        height: `calc(${app.defaultWindowSize.height} * var(--xp-scale))`,
        transform: `translate(calc(-50% + ${scaledOffset}), calc(-50% + ${scaledOffset}))`,
      }}
    >
      <div className="title-bar">
        <div className="title-bar-title">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server, see docs/04-static-export-github-pages.md */}
          <img src={app.desktopIcon} alt="" className="title-bar-icon" />
          <div className="title-bar-text">{app.title}</div>
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close" onClick={() => onClose(app.id)}></button>
        </div>
      </div>
      <div className="window-body">
        <p>{app.title} — content coming in a later step.</p>
      </div>
    </div>
  );
}
