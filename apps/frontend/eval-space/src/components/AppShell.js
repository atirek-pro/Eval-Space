"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getMe, hasSession, signOut } from "@/lib/auth";

// The signed-in app: a sidebar listing the features and the selected feature's screen beside it.
// Only for signed-in people: without a session, or once it can't be refreshed, it opens /signin. The page is
// always rendered (Next.js validates every segment for instant navigation, and a page that isn't rendered
// can't be checked), but it stays hidden and inert until the API has confirmed who is signed in.
// Each feature is a group: a heading, then its sub-sections as links. Collapsed, only the sub-section icons show.
const FEATURES = [
  {
    base: "/dashboard/compare-models",
    label: "Compare Models",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 16V9M10 16V4M16 16v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    items: [
      {
        href: "/dashboard/compare-models/manual",
        label: "Manual",
        icon: (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4.5 4h11A1.5 1.5 0 0 1 17 5.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-3.5 2.5V14h-1A1.5 1.5 0 0 1 3 12.5v-7A1.5 1.5 0 0 1 4.5 4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/dashboard/compare-models/byod",
        label: "Bring-Your-Own-Data",
        icon: (
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 12.5V3.5M6.5 7 10 3.5 13.5 7M4 12v2.5A1.5 1.5 0 0 0 5.5 16h9a1.5 1.5 0 0 0 1.5-1.5V12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
];

const SIDEBAR_KEY = "evalspace.sidebar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);

  // the sidebar's open/closed choice is remembered; read after mount so the server and first render agree
  useEffect(() => {
    if (localStorage.getItem(SIDEBAR_KEY) === "closed") setSideOpen(false); // eslint-disable-line react-hooks/set-state-in-effect -- one read of a saved preference
  }, []);

  const toggleSide = () => {
    setSideOpen((open) => {
      localStorage.setItem(SIDEBAR_KEY, open ? "closed" : "open");
      return !open;
    });
  };

  useEffect(() => {
    if (!hasSession()) {
      window.location.replace("/signin");
      return;
    }
    let active = true;
    getMe()
      .then((me) => active && setUser(me))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) window.location.replace("/signin");
        else setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const onSignOut = async () => {
    setSigningOut(true);
    await signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load restarts the kit's scripts
    window.location.assign("/signin");
  };

  return (
    <>
      {!user && (
        <div className="app-gate">
          {error ? (
            <div className="app-gate__box" role="alert">
              <p>{error}</p>
              <button className="btn btn--secondary btn--sm" type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : (
            <p className="app-gate__box" role="status" aria-busy="true">Loading…</p>
          )}
        </div>
      )}

      <div className="app" data-side={sideOpen ? "open" : "closed"} hidden={!user} inert={!user}>
        <aside className="app__side" id="app-sidebar">
          <div className="app__top">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full load, so the landing page's kit scripts start */}
            <a className="nav__logo app__logo" href="/">
              <span className="mark" data-mark="ring" aria-hidden="true"></span>
              <span className="app__text">Eval Space</span>
            </a>
            <button
              className="app__toggle"
              type="button"
              onClick={toggleSide}
              aria-controls="app-sidebar"
              aria-expanded={sideOpen}
              aria-label={sideOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sideOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7.5 4v12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <nav className="app__nav" aria-label="Features">
            <p className="app__label">Features</p>
            {FEATURES.map(({ base, label, icon, items }) => (
              <div className="app__group" key={base} role="group" aria-label={label}>
                <p className={`app__group-head${pathname.startsWith(base) ? " is-current" : ""}`} aria-hidden="true">
                  {icon}
                  <span className="app__text">{label}</span>
                </p>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    className="app__link app__sublink"
                    href={item.href}
                    title={sideOpen ? undefined : `${label}: ${item.label}`}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.icon}
                    <span className="app__text">{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="app__account">
            <a className="app__who" href="/user" title="Your account">
              <span className="app__name">{user?.full_name}</span>
              <span className="app__email">{user?.email}</span>
            </a>
            <button
              className="btn btn--secondary btn--sm app__signout"
              type="button"
              onClick={onSignOut}
              disabled={signingOut}
              aria-busy={signingOut}
              title={sideOpen ? undefined : "Sign out"}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M8 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8M12.5 13.5 16 10l-3.5-3.5M16 10H8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="app__text">{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </aside>

        <main className="app__main" id="top">
          {children}
        </main>
      </div>
    </>
  );
}
