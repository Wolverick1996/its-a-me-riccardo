"use client";

import { useEffect } from "react";
import { useSessionStore, type SessionStage } from "@/store/useSessionStore";
import { useVolumeStore } from "@/store/useVolumeStore";
import XpLogo from "./XpLogo";

// The real shutdown chime's own length (~3.27s, confirmed with `afinfo`) — this screen waits for the sound to finish before moving on.
const LOGGING_OFF_DURATION_MS = 3300;
// Long enough to actually read the caption below, not just register as a blip — shared by every silent phase (shuttingDown, standingBy), none of which wait on a sound.
const SILENT_STAGE_DURATION_MS = 2500;

const CAPTIONS: Partial<Record<SessionStage, string>> = {
  loggingOff: "Logging off...",
  shuttingDown: "Windows is shutting down...",
  standingBy: "Preparing to stand by...",
};

/** Shown for the "loggingOff", "shuttingDown", and "standingBy" session stages — same chrome, just a different caption, sound, and destination. The "Turn off computer" dialog's "Log Off"/"Turn Off"/"Stand By" options each visit a different subset of these: "Log Off" only "loggingOff" (-> LoginScreen); "Turn Off" chains "loggingOff" straight into "shuttingDown" (-> StartupScreen), same as LoginScreen's own "Turn off computer" button; "Stand By" only "standingBy" (-> LoginScreen), never touching "loggingOff" at all since there's no session being ended. Rendered with `key={stage}` by software/page.tsx so this remounts (and its mount effect re-fires) on the loggingOff -> shuttingDown leg of that chain. */
export default function ShutdownScreen() {
  const stage = useSessionStore((state) => state.stage);
  const finishLoggingOff = useSessionStore((state) => state.finishLoggingOff);
  const finishShuttingDown = useSessionStore(
    (state) => state.finishShuttingDown,
  );
  const finishStandingBy = useSessionStore((state) => state.finishStandingBy);
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
    const finish =
      stage === "loggingOff"
        ? finishLoggingOff
        : stage === "standingBy"
          ? finishStandingBy
          : finishShuttingDown;
    const timer = setTimeout(
      finish,
      isLoggingOff ? LOGGING_OFF_DURATION_MS : SILENT_STAGE_DURATION_MS,
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
          <p className="shutting-down-caption">{CAPTIONS[stage]}</p>
        </div>
      </div>
      <div className="login-screen-bar login-screen-bar-bottom" />
    </div>
  );
}
