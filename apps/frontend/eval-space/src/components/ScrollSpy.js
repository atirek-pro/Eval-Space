"use client";

import { useEffect } from "react";

// Keeps the address bar's #hash on the section being read, and marks its nav link with aria-current.
// replaceState changes the URL without scrolling or adding a history entry per section, so Back still
// leaves the page. Above the first section (the hero) the hash is cleared.
const SECTIONS = ["features", "about", "blog", "contact"];

export default function ScrollSpy() {
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    let current = location.hash.slice(1);
    let frame = 0;

    const update = () => {
      frame = 0;
      // a section is current once its top passes 40% of the way down the viewport
      const line = window.innerHeight * 0.4;
      let id = "";
      for (const el of els) if (el.getBoundingClientRect().top <= line) id = el.id;
      // at the very bottom the last section is current even if it is short
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) id = els.at(-1)?.id ?? id;
      if (id === current) return;
      current = id;
      history.replaceState(history.state, "", id ? `#${id}` : location.pathname + location.search);
      document.querySelectorAll(".nav__link").forEach((a) => {
        if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
