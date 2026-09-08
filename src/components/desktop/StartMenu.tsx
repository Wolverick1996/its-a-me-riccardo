"use client";

import type { AppDefinition } from "@/content/types";

export default function StartMenu({
  apps,
  onSelect,
}: {
  apps: AppDefinition[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="start-menu" role="menu">
      <div className="start-menu-header">RickXP</div>
      <div className="start-menu-list">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            role="menuitem"
            className="start-menu-item"
            onClick={() => onSelect(app.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server, see docs/04-static-export-github-pages.md */}
            <img
              src={app.desktopIcon}
              alt=""
              className="start-menu-item-icon"
            />
            {app.title}
          </button>
        ))}
      </div>
    </div>
  );
}
