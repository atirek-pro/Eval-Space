"use client";

import { useEffect } from "react";

// The tasteskill kit's modules change the DOM as they start (the phone menu, pause discs, the hero's
// entrance and steps), so they must run only once React has hydrated the page. An effect
// runs after hydration has committed; the guard keeps React's dev double-run from loading them twice.
// The one diagram draws itself from its own component (Diagram.js), so the kit's mount.js is not loaded.
const KIT = [
  "/assets/system.js",
  "/assets/motion/motion.js",
  "/assets/layout/layout.js",
];

export default function KitScripts() {
  useEffect(() => {
    for (const src of KIT) {
      if (document.querySelector(`script[data-kit="${src}"]`)) continue;
      const s = document.createElement("script");
      s.type = "module";
      s.src = src;
      s.dataset.kit = src;
      document.body.appendChild(s);
    }
  }, []);
  return null;
}
