import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure static site: GitHub Pages doesn't run Node, so there is no Next.js server in production (no API routes, no middleware, no redirects/rewrites defined here). `next build` generates an `out/` folder containing only HTML/CSS/JS files ready to be served by a static host.
  output: "export",
  // next/image normally requires a runtime image-optimization server, which doesn't exist on static hosting: disable automatic optimization.
  images: { unoptimized: true },
  // Generates `page/index.html` instead of `page.html`: more robust for relative links on static hosting like GitHub Pages.
  trailingSlash: true,
};

export default nextConfig;
