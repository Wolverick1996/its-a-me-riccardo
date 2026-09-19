"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useVolumeStore } from "@/store/useVolumeStore";
import XpLogo from "./XpLogo";

// The real shutdown chime's own length (~3.27s, confirmed with `afinfo`) — this screen waits for the sound to finish before moving on.
const LOGGING_OFF_DURATION_MS = 3300;
// Long enough to actually read the caption below, not just register as a blip.
const SHUTTING_DOWN_DURATION_MS = 2500;

/** Shown for the "loggingOff" and "shuttingDown" session stages — same chrome, just a different caption, sound, and destination. The start menu's "Log Off" only ever visits "loggingOff" (-> LoginScreen); its "Turn Off" chains straight through into "shuttingDown" (-> StartupScreen), same as LoginScreen's own "Turn off computer" button. Rendered with `key={stage}` by software/page.tsx so this remounts (and its mount effect re-fires) on the loggingOff -> shuttingDown leg of that chain. */
export default function ShutdownScreen() {
  const stage = useSessionStore((state) => state.stage);
  const finishLoggingOff = useSessionStore((state) => state.finishLoggingOff);
  const finishShuttingDown = useSessionStore(
    (state) => state.finishShuttingDown,
  );
  const isLoggingOff = stage === "loggingOff";

  useEffect(() => {
    if (isLoggingOff) {
      const { volume, muted } = useVolumeStore.getState();
      if (!muted && volume > 0) {
        const audio = new Audio("/sounds/Windows%20XP%20Shutdown.mp3");
        audio.volume = volume / 100;
        void audio.play().catch(() => {
          // Autoplay blocked or similar — nothing else depends on this succeeding.
        });
      }
    }
    const timer = setTimeout(
      isLoggingOff ? finishLoggingOff : finishShuttingDown,
      isLoggingOff ? LOGGING_OFF_DURATION_MS : SHUTTING_DOWN_DURATION_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs once on mount; this component has exactly one entry and one exit per visit, same as WelcomeScreen/StartupScreen.
  }, []);

  return (
    <div className="win-xp-shell shutting-down-screen">
      <div className="login-screen-bar login-screen-bar-top" />
      <div className="login-screen-body shutting-down-field">
        <div className="shutting-down-content">
          <XpLogo
            prefix="login-screen-logo"
            textClassName="shutting-down-logo-text"
            xpWrapperClassName="shutting-down-xp-overlay"
          />
          <p className="shutting-down-caption">
            {isLoggingOff ? "Logging off..." : "Windows is shutting down..."}
          </p>
        </div>
      </div>
      <div className="login-screen-bar login-screen-bar-bottom" />
    </div>
  );
}
