import { create } from "zustand";

export type SessionStage =
  | "boot"
  | "login"
  | "welcome"
  | "desktop"
  | "loggingOff"
  | "shuttingDown"
  | "standingBy";

interface SessionState {
  stage: SessionStage;
  /** Where the "loggingOff" beat lands once it finishes — set by whichever action started it, since Log Off and Turn Off (both start menu items) pass through it but diverge afterward. */
  afterLoggingOff: "login" | "shuttingDown";
  /** Set by finishStandingBy, consumed (and cleared) by LoginScreen's own account-tile click: true only for the one login that follows a Stand By, so that click can skip WelcomeScreen and play the Logon sound instead of the Startup one — same distinction real XP draws between a full boot login and resuming a suspended session. Cleared on finishBoot too, so a stray "Turn off computer" from LoginScreen before ever logging back in (a full power cycle) doesn't leave this stale for the next real login. */
  resumingFromStandBy: boolean;
  /** StartupScreen, once its own animation finishes: boot -> login. */
  finishBoot: () => void;
  /** Clicking the account tile on LoginScreen: login -> welcome. */
  logIn: () => void;
  /** WelcomeScreen, once its animation/sound finish: welcome -> desktop. */
  enterDesktop: () => void;
  /** LoginScreen's own account-tile click when resumingFromStandBy is true: login -> desktop directly, skipping WelcomeScreen entirely. */
  resumeDesktop: () => void;
  /** The start menu's "Log Off" item: desktop -> loggingOff -> login. */
  logOff: () => void;
  /** The "Turn off computer" dialog's own "Turn Off" option: desktop -> loggingOff -> shuttingDown -> boot, same as real XP ending the session before it actually powers off. */
  turnOff: () => void;
  /** The "Turn off computer" dialog's "Stand By" option: desktop -> standingBy -> login. Unlike turnOff/logOff, nothing clears the window manager store for this path — real standby pauses a session rather than ending it, so every open window's geometry survives untouched for whenever the user logs back in. */
  standBy: () => void;
  /** LoginScreen's "Turn off computer" button: login -> shuttingDown -> boot. Never a session to log off from here, so this skips straight past "loggingOff". */
  shutDown: () => void;
  /** ShutdownScreen's "Logging off..." phase, once its own beat finishes. */
  finishLoggingOff: () => void;
  /** ShutdownScreen's "Windows is shutting down..." phase, once its own beat finishes: shuttingDown -> boot, same as turning the machine back on. */
  finishShuttingDown: () => void;
  /** ShutdownScreen's "Preparing to stand by..." phase, once its own beat finishes: standingBy -> login, same destination as Log Off but by a path that never touched the window manager store. */
  finishStandingBy: () => void;
}

/** Drives which of StartupScreen/LoginScreen/WelcomeScreen/Desktop/ShutdownScreen the software page renders. Logging off and standing by both return to the login screen directly, same as real XP — neither replays the boot screen; shutting down does, since that's a full power cycle. */
export const useSessionStore = create<SessionState>((set) => ({
  stage: "boot",
  afterLoggingOff: "login",
  resumingFromStandBy: false,
  finishBoot: () => set({ stage: "login", resumingFromStandBy: false }),
  logIn: () => set({ stage: "welcome" }),
  enterDesktop: () => set({ stage: "desktop" }),
  resumeDesktop: () => set({ stage: "desktop", resumingFromStandBy: false }),
  logOff: () => set({ stage: "loggingOff", afterLoggingOff: "login" }),
  turnOff: () => set({ stage: "loggingOff", afterLoggingOff: "shuttingDown" }),
  standBy: () => set({ stage: "standingBy" }),
  shutDown: () => set({ stage: "shuttingDown" }),
  finishLoggingOff: () => set((state) => ({ stage: state.afterLoggingOff })),
  finishShuttingDown: () => set({ stage: "boot" }),
  finishStandingBy: () => set({ stage: "login", resumingFromStandBy: true }),
}));
