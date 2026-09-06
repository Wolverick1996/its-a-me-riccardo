import type { Project } from "./types";

/** Placeholder content: replace with real projects. Both the XP window (WindowContent/ProjectsApp) and the Nokia screen (nokia/Screens/ProjectsScreen) read this same array. */
export const projects: Project[] = [
  {
    id: "project-one",
    name: "Project One",
    tagline: "A short, catchy description of the project.",
    description:
      "Placeholder description for the first project. This is where a paragraph explaining the problem solved, the technical approach, and the outcome will go.",
    tech: ["TypeScript", "React"],
    year: 2024,
    links: [{ label: "Repository", href: "https://github.com/" }],
  },
  {
    id: "project-two",
    name: "Project Two",
    tagline: "Another catchy short description.",
    description:
      "Placeholder description for the second project, to be replaced with real content once available.",
    tech: ["Next.js", "Node.js"],
    year: 2023,
    links: [{ label: "Demo", href: "https://example.com/" }],
  },
  {
    id: "project-three",
    name: "Project Three",
    tagline: "Third placeholder description.",
    description:
      "Placeholder description for the third project, just to have three sample entries in the portfolio while the interface is being built.",
    tech: ["Python"],
    year: 2022,
  },
];
