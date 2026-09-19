"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import XpLogo from "./XpLogo";

// Two full passes of the sliding progress bar (each pass is exactly `xp-boot-progress`'s own 2090ms in startup-screen.css) so the screen never cuts away mid-slide.
const BOOT_DURATION_MS = 4180;

export default function StartupScreen() {
  const finishBoot = useSessionStore((state) => state.finishBoot);

  useEffect(() => {
    const timer = setTimeout(finishBoot, BOOT_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs once on mount; this screen has exactly one entry and one exit.
  }, []);

  return (
    <div className="startup-screen">
      <XpLogo prefix="startup-screen-logo" />
      <div className="startup-screen-progress-track">
        <div className="startup-screen-progress-group">
          <span className="startup-screen-progress-segment" />
          <span className="startup-screen-progress-segment" />
          <span className="startup-screen-progress-segment" />
        </div>
      </div>
      <p className="startup-screen-copyright">Copyright © Riccardo Corona</p>
    </div>
  );
}
