"use client";

import type { AppDefinition } from "@/content/types";

export default function StartMenu({
  apps,
  onSelect,
  onLogOff,
  onTurnOff,
}: {
  apps: AppDefinition[];
  onSelect: (id: string) => void;
  onLogOff: () => void;
  onTurnOff: () => void;
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
            {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server */}
            <img
              src={app.desktopIcon}
              alt=""
              className="start-menu-item-icon"
            />
            {app.title}
          </button>
        ))}
      </div>
      <div className="start-menu-footer">
        <button
          type="button"
          role="menuitem"
          className="start-menu-item"
          onClick={onLogOff}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server */}
          <img
            src="/icons/desktop/Logout.png"
            alt=""
            className="start-menu-item-icon"
          />
          Log Off
        </button>
        <button
          type="button"
          role="menuitem"
          className="start-menu-item"
          onClick={onTurnOff}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server */}
          <img
            src="/icons/desktop/Power.png"
            alt=""
            className="start-menu-item-icon"
          />
          Turn Off
        </button>
      </div>
    </div>
  );
}
