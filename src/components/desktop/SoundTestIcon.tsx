"use client";

import { useEffect, useRef } from "react";
import { useVolumeStore } from "@/store/useVolumeStore";

// Temporary: lets the volume flyout be checked against a real <audio> element (drag the slider or toggle Mute while this plays) until real desktop actions get their own XP sounds wired up — see ROADMAP.md. Remove this file and its one usage in Desktop.tsx once that happens; it isn't a real portfolio "app" and deliberately isn't part of src/content/apps-registry.ts.
export default function SoundTestIcon() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volume = useVolumeStore((state) => state.volume);
  const muted = useVolumeStore((state) => state.muted);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  return (
    <button
      type="button"
      className="desktop-icon"
      style={{ gridColumn: 1, gridRow: 7 }}
      onDoubleClick={toggle}
    >
      <audio ref={audioRef} src="/sounds/Windows%20XP%20Logon%20Sound.mp3" />
      {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimization server. */}
      <img
        src="/icons/desktop/Generic%20Document.png"
        alt=""
        draggable={false}
        className="desktop-icon-image"
      />
      <span className="desktop-icon-label">Logon Sound.mp3</span>
    </button>
  );
}
