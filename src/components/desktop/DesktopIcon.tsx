"use client";

import type { AppDefinition } from "@/content/types";

export default function DesktopIcon({
  app,
  selected,
  onSelect,
  onOpen,
}: {
  app: AppDefinition;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className="desktop-icon"
      onClick={(event) => {
        // A single click only selects (highlights the label); it shouldn't also reach Desktop's "click outside clears selection" handler.
        event.stopPropagation();
        onSelect(app.id);
      }}
      onDoubleClick={() => onOpen(app.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(app.id);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server, see docs/04-static-export-github-pages.md */}
      <img
        src={app.desktopIcon}
        alt=""
        className={`desktop-icon-image${selected ? " selected" : ""}`}
      />
      <span className={`desktop-icon-label${selected ? " selected" : ""}`}>
        {app.title}
      </span>
    </button>
  );
}
