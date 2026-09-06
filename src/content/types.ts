export type AppKind =
  "software" | "about" | "contact" | "education" | "resume" | "experience";

export interface AppDefinition {
  id: string;
  kind: AppKind;
  title: string;
  /** Path under /public/icons/desktop, used by the Desktop XP shell. */
  desktopIcon: string;
  /** false = the app exists in the registry but isn't shown yet. */
  enabled: boolean;
  defaultWindowSize: { width: number; height: number };
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  year: number;
  links?: { label: string; href: string }[];
}

export interface AboutInfo {
  headline: string;
  bio: string;
  skills: string[];
}

export interface ContactInfo {
  email: string;
  links: { label: string; href: string }[];
}
