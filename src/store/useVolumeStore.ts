import { create } from "zustand";

const DEFAULT_VOLUME = 75;

interface VolumeState {
  volume: number;
  muted: boolean;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}

/** Shared so any real <audio> element on the desktop can read the tray volume flyout's own volume/mute state, rather than each one carrying its own disconnected copy. */
export const useVolumeStore = create<VolumeState>((set) => ({
  volume: DEFAULT_VOLUME,
  muted: false,
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
}));
