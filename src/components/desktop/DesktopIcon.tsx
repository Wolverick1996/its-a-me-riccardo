"use client";

import type { CSSProperties } from "react";
import type { AppDefinition } from "@/content/types";

export default function DesktopIcon({
  app,
  selected,
  onSelect,
  onOpen,
  style,
}: {
  app: AppDefinition;
  selected: boolean;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  // Grid placement (and, while being dragged, a live transform) — computed by Desktop.tsx, which owns icon position state; this component only ever renders the position it's told.
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className="desktop-icon"
      data-app-id={app.id}
      style={style}
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
      {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server. */}
      <img
        src={app.desktopIcon}
        alt=""
        // Images are natively draggable by default — without this, grabbing one to reposition it (Desktop.tsx's own mouse-based drag) could instead be hijacked partway through by the browser's own image-drag gesture, which stops sending mousemove events (it fires drag/dragover instead) and left our drag state stuck with no further updates or a mouseup to end it.
        draggable={false}
        className={`desktop-icon-image${selected ? " selected" : ""}`}
      />
      <span className={`desktop-icon-label${selected ? " selected" : ""}`}>
        {app.title}
      </span>
    </button>
  );
}
