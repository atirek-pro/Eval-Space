"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// `section` = id of the on-page section this link scrolls to (home page only).
const navLinks = [
  { href: "/", label: "Home", section: "home" },
  { href: "/#features", label: "Features", section: "features" },
  { href: "/#about", label: "About Us", section: "about" },
  { href: "/#blog", label: "Blog", section: "blog" },
  { href: "/#contact", label: "Contact Us", section: "contact" },
];

const sectionIds = navLinks.filter((l) => l.section).map((l) => l.section);

// A section becomes "current" once its top crosses this line: 40% of the way
// down the viewport (never less than the sticky navbar height + breathing
// room). Viewport-relative so it feels the same on laptops and big monitors.
const ACTIVE_RATIO = 0.4;
const MIN_ACTIVE_OFFSET = 120;

function urlForSection(id) {
  return id === "home" ? "/" : `/#${id}`;
}

export default function Navbar() {
  const [active, setActive] = useState("home");

  // Scrollspy: track which section is in view and keep the URL in sync.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      if (window.location.pathname !== "/") return;

      const triggerLine = Math.max(
        MIN_ACTIVE_OFFSET,
        window.innerHeight * ACTIVE_RATIO,
      );

      let current = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= triggerLine) {
          current = id;
        }
      }
      current ??= "home";

      // At the very bottom, the last section may be too short to reach the
      // offset line — treat it as active so "Contact Us" still highlights.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atBottom) {
        const last = sectionIds.findLast((id) => document.getElementById(id));
        if (last) current = last;
      }

      setActive(current);

      const url = urlForSection(current);
      if (window.location.pathname + window.location.hash !== url) {
        // replaceState: updates the address bar without adding history entries.
        window.history.replaceState(null, "", url);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // On the home page, scroll smoothly ourselves instead of navigating.
  // On other pages, let <Link> navigate to "/" or "/#features" as normal.
  const handleSectionClick = (event, id) => {
    if (window.location.pathname !== "/") return;
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    if (id === "home") {
      // Already at the top -> scrollTo(0) is a no-op, so nothing changes.
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
    window.history.replaceState(null, "", urlForSection(id));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: brand + links */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link
            href="/"
            onClick={(e) => handleSectionClick(e, "home")}
            className="flex items-center gap-2"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
              ES
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Eval<span className="text-accent">Space</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-5 md:flex lg:gap-7">
            {navLinks.map((link) => {
              const isActive = link.section && link.section === active;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={
                      link.section
                        ? (e) => handleSectionClick(e, link.section)
                        : undefined
                    }
                    aria-current={isActive ? "location" : undefined}
                    className={`relative py-1 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-accent after:transition-transform after:duration-300 ${
                      isActive
                        ? "text-foreground after:scale-x-100"
                        : "text-muted hover:text-foreground after:scale-x-0"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: CTA */}
        <Link
          href="/signup"
          className="rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
        >
          Create Account
        </Link>
      </nav>
    </header>
  );
}
