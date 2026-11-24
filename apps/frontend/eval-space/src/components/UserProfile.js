"use client";

import { useEffect, useState } from "react";

import { getMe, hasSession, signOut } from "@/lib/auth";

// The signed-in user's page: who they are, from GET /auth/me, and a sign-out button. Without a session, or
// once the session can't be refreshed, it sends them to /signin. Laid out like the account screen: one
// narrow column in the middle of the screen.
function formatDate(iso) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

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
    <section className="section auth" aria-labelledby="user-h">
      <div className="wrap auth__wrap">
        <div className="auth__panel">
          {error ? (
            <div className="auth__head">
              <h1 id="user-h">Can&apos;t load your account</h1>
              <p className="split__lead">{error}</p>
              <button className="btn btn--secondary" type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : !user ? (
            <div className="auth__head" aria-busy="true">
              <h1 id="user-h">Your account</h1>
              <p className="split__lead" role="status">Loading your account…</p>
            </div>
          ) : (
            <>
              <div className="auth__head">
                <h1 id="user-h">Hi, {user.full_name.split(" ")[0]}</h1>
                <p className="split__lead">You&apos;re signed in to Eval Space.</p>
              </div>

              <dl className="profile">
                <div>
                  <dt>Full name</dt>
                  <dd>{user.full_name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Member since</dt>
                  <dd>{formatDate(user.created_at)}</dd>
                </div>
                <div>
                  <dt>Account ID</dt>
                  <dd className="profile__mono">{user.id}</dd>
                </div>
              </dl>

              <button
                className="btn btn--secondary auth__submit"
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                aria-busy={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
