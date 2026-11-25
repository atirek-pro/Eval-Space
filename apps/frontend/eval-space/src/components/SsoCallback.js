"use client";

import { useEffect, useState } from "react";

import { signInWithSso } from "@/lib/auth";
import { providerName, takeSsoCallback } from "@/lib/sso";

// Where Google and GitHub send the person back after they approve: checks the answer, posts the code to
// the API and opens /user. A code works only once, so this runs once per page load even when React runs
// effects twice in development.
let handled = false;

function errorMessage(err, name) {
  if (err.status === 409) return err.message; // the email already has an account; the API says what to do
  if (err.status === 400) return err.message; // bad code or no verified email
  if (err.status === 503) return `Signing in with ${name} isn't set up yet.`;
  if (err.status === 502) return `Couldn't reach ${name}. Try again.`;
  return err.message;
}

export default function SsoCallback({ provider }) {
  const name = providerName(provider);
  const [error, setError] = useState("");

  useEffect(() => {
    if (handled) return;
    handled = true;

    (async () => {
      const result = takeSsoCallback(provider);
      if (result.error) return setError(result.error);
      try {
        await signInWithSso(provider, result.code);
        // a full page load, so the kit's scripts start on the new page
        window.location.replace("/user");
      } catch (err) {
        setError(errorMessage(err, name));
      }
    })();
  }, [provider, name]);

  return (
    <section className="section auth" aria-labelledby="sso-h">
      <div className="wrap auth__wrap">
        <div className="auth__panel">
          {error ? (
            <>
              <div className="auth__head">
                <h1 id="sso-h">Couldn&apos;t sign you in</h1>
                <p className="split__lead" role="alert">{error}</p>
              </div>
              <a className="btn btn--primary auth__submit" href="/signin">Back to sign in</a>
            </>
          ) : (
            <div className="auth__head" aria-busy="true">
              <h1 id="sso-h">Signing you in</h1>
              <p className="split__lead" role="status">Finishing sign-in with {name}…</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
