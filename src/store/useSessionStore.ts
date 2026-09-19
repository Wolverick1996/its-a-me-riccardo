import { create } from "zustand";

export type SessionStage =
  "boot" | "login" | "welcome" | "desktop" | "loggingOff" | "shuttingDown";

interface SessionState {
  stage: SessionStage;
  /** Where the "loggingOff" beat lands once it finishes — set by whichever action started it, since Log Off and Turn Off (both start menu items) pass through it but diverge afterward. */
  afterLoggingOff: "login" | "shuttingDown";
  /** StartupScreen, once its own animation finishes: boot -> login. */
  finishBoot: () => void;
  /** Clicking the account tile on LoginScreen: login -> welcome. */
  logIn: () => void;
  /** WelcomeScreen, once its animation/sound finish: welcome -> desktop. */
  enterDesktop: () => void;
  /** The start menu's "Log Off" item: desktop -> loggingOff -> login. */
  logOff: () => void;
  /** The start menu's "Turn Off" item: desktop -> loggingOff -> shuttingDown -> boot, same as real XP ending the session before it actually powers off. */
  turnOff: () => void;
  /** LoginScreen's "Turn off computer" button: login -> shuttingDown -> boot. Never a session to log off from here, so this skips straight past "loggingOff". */
  shutDown: () => void;
  /** ShutdownScreen's "Logging off..." phase, once its own beat finishes. */
  finishLoggingOff: () => void;
  /** ShutdownScreen's "Windows is shutting down..." phase, once its own beat finishes: shuttingDown -> boot, same as turning the machine back on. */
  finishShuttingDown: () => void;
}

/** Drives which of StartupScreen/LoginScreen/WelcomeScreen/Desktop/ShutdownScreen the software page renders. Logging off returns to the login screen directly, same as real XP — it never replays the boot screen; shutting down does, since that's a full power cycle. */
export const useSessionStore = create<SessionState>((set) => ({
  stage: "boot",
  afterLoggingOff: "login",
  finishBoot: () => set({ stage: "login" }),
  logIn: () => set({ stage: "welcome" }),
  enterDesktop: () => set({ stage: "desktop" }),
  logOff: () => set({ stage: "loggingOff", afterLoggingOff: "login" }),
  turnOff: () => set({ stage: "loggingOff", afterLoggingOff: "shuttingDown" }),
  shutDown: () => set({ stage: "shuttingDown" }),
  finishLoggingOff: () => set((state) => ({ stage: state.afterLoggingOff })),
  finishShuttingDown: () => set({ stage: "boot" }),
}));
