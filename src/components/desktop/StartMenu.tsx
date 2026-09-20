"use client";

import { useEffect, useId } from "react";
import type { AppDefinition } from "@/content/types";
import { ACCOUNT_NAME, ACCOUNT_AVATAR } from "./account";

/** Right-column filler matching real XP's own "My Documents"/"My Computer"/"Control Panel" group — not backed by any app or window, just placeholder content until those targets have somewhere real to point to. The first group is bold, matching real XP; the other two aren't. */
const PLACEHOLDER_GROUPS: { icon: string; label: string; bold?: boolean }[][] =
  [
    [
      { icon: "My Documents", label: "My Documents", bold: true },
      { icon: "Recent Documents", label: "My Recent Documents", bold: true },
      { icon: "My Pictures", label: "My Pictures", bold: true },
      { icon: "My Music", label: "My Music", bold: true },
      { icon: "My Computer", label: "My Computer", bold: true },
    ],
    [
      { icon: "Control Panel", label: "Control Panel" },
      { icon: "Default Programs", label: "Set Program Access and Defaults" },
      { icon: "Printers and Faxes", label: "Printers and Faxes" },
    ],
    [
      { icon: "Help and Support", label: "Help and Support" },
      { icon: "Search", label: "Search" },
      { icon: "Run", label: "Run..." },
    ],
  ];

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
  const arrowGradientId = useId();

  // Real XP's own mnemonics, underlined below on "All Programs" (P), "Log Off" (L), and "Turn Off Computer" (U in "Turn") — matching real XP's own accelerator letters, not each word's first letter. No modifier needed: once a menu is open (true for this component's whole lifetime), the bare letter alone activates it. Ignores ctrlKey so it doesn't steal a browser shortcut. "P" isn't wired to anything — there's no real submenu behind it. The other two wrap their label in one <span> so .start-menu-item's flex gap doesn't land between the underlined letter and the rest of the word.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey) return;
      const key = event.key.toLowerCase();
      if (key === "l") {
        event.preventDefault();
        onLogOff();
      } else if (key === "u") {
        event.preventDefault();
        onTurnOff();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onLogOff, onTurnOff]);

  return (
    <div className="start-menu" role="menu">
      <div className="start-menu-header">
        <img src={ACCOUNT_AVATAR} alt="" className="start-menu-avatar" />
        <span className="start-menu-username">{ACCOUNT_NAME}</span>
      </div>
      <div className="start-menu-header-bevel" />
      <div className="start-menu-body">
        <div className="start-menu-programs">
          {apps.map((app) => (
            <button
              key={app.id}
              type="button"
              role="menuitem"
              className="start-menu-item start-menu-item-large"
              onClick={() => onSelect(app.id)}
            >
              <img
                src={app.desktopIcon}
                alt=""
                className="start-menu-item-icon start-menu-item-icon-large"
              />
              {app.title}
            </button>
          ))}
          {/* Decorative, like PLACEHOLDER_GROUPS below — there's no expanded program list behind this site's own app roster to flip out to. */}
          <div className="start-menu-all-programs-divider" />
          <div className="start-menu-all-programs">
            <span>
              All <span className="start-menu-mnemonic">P</span>rograms
            </span>
            {/* Hand-drawn, not an image asset — a rounded-corner "play" triangle with a glossy radial highlight, matching the shape of real XP's own green arrow glyph. */}
            <svg
              className="start-menu-all-programs-arrow"
              viewBox="0 0 21 28"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id={arrowGradientId} cx="35%" cy="25%" r="80%">
                  <stop offset="0%" stopColor="#c3f0c3" />
                  <stop offset="45%" stopColor="#4aae41" />
                  <stop offset="100%" stopColor="#109d09" />
                </radialGradient>
              </defs>
              <path
                d="M3,4.5 L3,21.5 Q3,24.5 5.437,22.749 L16.969,14.459 Q19,13 16.969,11.541 L5.437,3.251 Q3,1.5 3,4.5 Z"
                fill={`url(#${arrowGradientId})`}
                stroke="#0a6e07"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="start-menu-places">
          {PLACEHOLDER_GROUPS.map((group, groupIndex) => (
            <div className="start-menu-places-group" key={groupIndex}>
              {group.map(({ icon, label, bold }) => (
                <div
                  className={
                    bold
                      ? "start-menu-item start-menu-item-placeholder start-menu-item-bold"
                      : "start-menu-item start-menu-item-placeholder"
                  }
                  key={label}
                >
                  <img
                    src={`/icons/desktop/${encodeURIComponent(icon)}.png`}
                    alt=""
                    className="start-menu-item-icon"
                  />
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="start-menu-footer">
        <button
          type="button"
          role="menuitem"
          className="start-menu-item"
          onClick={onLogOff}
        >
          <img
            src="/icons/desktop/Logout.png"
            alt=""
            className="start-menu-item-icon"
          />
          <span>
            <span className="start-menu-mnemonic">L</span>og Off
          </span>
        </button>
        <button
          type="button"
          role="menuitem"
          className="start-menu-item"
          onClick={onTurnOff}
        >
          <img
            src="/icons/desktop/Power.png"
            alt=""
            className="start-menu-item-icon"
          />
          <span>
            T<span className="start-menu-mnemonic">u</span>rn Off Computer
          </span>
        </button>
      </div>
    </div>
  );
}
