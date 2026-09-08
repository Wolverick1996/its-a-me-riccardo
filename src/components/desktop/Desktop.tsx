"use client";

import { useState } from "react";
import { getEnabledApps } from "@/content/apps-registry";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";

const apps = getEnabledApps();

export default function Desktop() {
  // openIds is insertion order — stable, used for the taskbar's button order and each window's cascade offset, so switching focus between windows never reshuffles either.
  // zOrder is a separate paint order: absolutely positioned windows with no z-index yet (that's step 3's job, with react-rnd + Zustand) stack by DOM order, so moving the focused id to the end of THAT list keeps it visually on top without touching openIds.
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  function focus(id: string) {
    setZOrder((ids) => [...ids.filter((existing) => existing !== id), id]);
    setFocusedId(id);
  }

  function openApp(id: string) {
    setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    focus(id);
    setStartMenuOpen(false);
  }

  function closeApp(id: string) {
    setOpenIds((ids) => ids.filter((existing) => existing !== id));
    setZOrder((ids) => ids.filter((existing) => existing !== id));
    setFocusedId((current) => (current === id ? null : current));
  }

  const openApps = openIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app) => app !== undefined);
  const paintApps = zOrder
    .map((id) => apps.find((app) => app.id === id))
    .filter((app) => app !== undefined);

  return (
    <div
      className="win-xp-shell desktop-surface relative h-screen w-screen overflow-hidden"
      style={{ backgroundImage: "url(/wallpaper/Bliss.jpg)" }}
      onClick={() => {
        setStartMenuOpen(false);
        setSelectedIconId(null);
      }}
    >
      <div className="desktop-icons">
        {apps.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            selected={app.id === selectedIconId}
            onSelect={setSelectedIconId}
            onOpen={openApp}
          />
        ))}
      </div>
      {paintApps.map((app) => (
        <Window
          key={app.id}
          app={app}
          cascade={openIds.indexOf(app.id)}
          isFocused={app.id === focusedId}
          onFocus={focus}
          onClose={closeApp}
        />
      ))}
      <Taskbar
        openApps={openApps}
        focusedId={focusedId}
        startMenuOpen={startMenuOpen}
        onToggleStart={() => setStartMenuOpen((open) => !open)}
        onSelectWindow={focus}
      />
      {startMenuOpen && <StartMenu apps={apps} onSelect={openApp} />}
    </div>
  );
}
