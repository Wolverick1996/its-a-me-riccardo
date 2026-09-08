import type { AppDefinition } from "./types";

/** Single source of truth for the "apps": both the Desktop XP shell (icons/windows) and the Nokia 3310 shell (menu entries) iterate this same array, filtering on `enabled`. */
export const apps: AppDefinition[] = [
  {
    id: "software",
    kind: "software",
    title: "Projects",
    desktopIcon: "/icons/desktop/My%20Documents.png",
    enabled: true,
    defaultWindowSize: { width: 640, height: 440 },
  },
  {
    id: "about",
    kind: "about",
    title: "About Me",
    desktopIcon: "/icons/desktop/Information.png",
    enabled: true,
    defaultWindowSize: { width: 480, height: 400 },
  },
  {
    id: "contact",
    kind: "contact",
    title: "Contact",
    desktopIcon: "/icons/desktop/Outlook%20Express.png",
    enabled: true,
    defaultWindowSize: { width: 420, height: 320 },
  },
  {
    id: "education",
    kind: "education",
    title: "Education",
    desktopIcon: "/icons/desktop/Windows%20Journal.png",
    enabled: true,
    defaultWindowSize: { width: 480, height: 400 },
  },
  {
    id: "resume",
    kind: "resume",
    title: "Resume",
    desktopIcon: "/icons/desktop/Generic%20Document.png",
    enabled: true,
    defaultWindowSize: { width: 480, height: 600 },
  },
  {
    id: "experience",
    kind: "experience",
    title: "Experience",
    desktopIcon: "/icons/desktop/Briefcase.png",
    enabled: true,
    defaultWindowSize: { width: 480, height: 400 },
  },
];

export function getEnabledApps(): AppDefinition[] {
  return apps.filter((app) => app.enabled);
}
