import { create } from "zustand";

export type SessionStage = "login" | "welcome" | "desktop";

interface SessionState {
  stage: SessionStage;
  /** Clicking the account tile on LoginScreen: login -> welcome. */
  logIn: () => void;
  /** WelcomeScreen, once its animation/sound finish: welcome -> desktop. */
  enterDesktop: () => void;
}

/** Drives which of LoginScreen/WelcomeScreen/Desktop the software page renders. Log off (desktop -> login) is a future step, not implemented yet, so there's no action for it here until something actually calls it. */
export const useSessionStore = create<SessionState>((set) => ({
  stage: "login",
  logIn: () => set({ stage: "welcome" }),
  enterDesktop: () => set({ stage: "desktop" }),
}));
