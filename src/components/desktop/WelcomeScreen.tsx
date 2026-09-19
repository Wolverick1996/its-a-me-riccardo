"use client";

import { useEffect } from "react";
import cx from "classnames";
import { useSessionStore } from "@/store/useSessionStore";
import { useCursorStore } from "@/store/useCursorStore";
import { playSessionSound } from "@/lib/playSessionSound";

// Real XP's Welcome screen is a brief beat, not as long as the startup chime itself (~4.9s, confirmed with `afinfo`) — about half its length, landing on the Desktop while the chime is still playing, same as real XP does. The chime isn't cut off early for it: see playSessionSound below, not tied to this screen's own lifecycle.
const WELCOME_DURATION_MS = 2600;

export default function WelcomeScreen() {
  const enterDesktop = useSessionStore((state) => state.enterDesktop);
  const cursor = useCursorStore((state) => state.cursor);
  const setCursor = useCursorStore((state) => state.setCursor);

  useEffect(() => {
    // LoginScreen's own account-tile click already switched the cursor to "appStarting" — cleared here once the startup chime it's waiting on actually finishes (or, if there's no chime to wait for at all, right away instead of forever).
    playSessionSound("/sounds/Windows%20XP%20Startup.mp3", {
      onEnded: () => setCursor("default"),
      onUnplayed: () => setCursor("default"),
    });
    const timer = setTimeout(enterDesktop, WELCOME_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs once on mount; this screen has exactly one entry and one exit.
  }, []);

  return (
    <div
      className={cx("win-xp-shell", "welcome-screen", {
        "cursor-app-starting": cursor === "appStarting",
      })}
    >
      <div className="login-screen-bar login-screen-bar-top" />
      {/* Same field chrome as LoginScreen (login-screen-body itself, not a copy) — real XP's Welcome screen is the login screen's own bars/field/corner-glow with just the two-panel content swapped for this one word, not a different background. */}
      <div className="login-screen-body welcome-screen-field">
        <p className="welcome-screen-text">welcome</p>
      </div>
      <div className="login-screen-bar login-screen-bar-bottom" />
    </div>
  );
}
