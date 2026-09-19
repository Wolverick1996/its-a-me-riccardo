import { create } from "zustand";

export type CursorState = "default" | "appStarting" | "busy";

interface CursorStoreState {
  cursor: CursorState;
  setCursor: (cursor: CursorState) => void;
}

/** Shared across every session-flow screen (LoginScreen, WelcomeScreen, Desktop, ShutdownScreen), each a separate top-level component swapped in and out by software/page.tsx — a plain component-local state wouldn't survive that swap, but this does. "appStarting" is real XP's arrow+hourglass combo (the account tile click, until the desktop's loaded and its startup chime has finished); "busy" is the plain hourglass real XP shows for the brief pause between clicking Log Off/Stand By/Turn Off and the corresponding "…" screen actually appearing. */
export const useCursorStore = create<CursorStoreState>((set) => ({
  cursor: "default",
  setCursor: (cursor) => set({ cursor }),
}));
