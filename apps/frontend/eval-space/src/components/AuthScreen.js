"use client";

import { useEffect, useState } from "react";

import { hasSession, signIn, signUp } from "@/lib/auth";
import { providerName, startSso } from "@/lib/sso";

// The account screen: create an account (/signup) or sign in (/signin) on one layout. One narrow column
// in the middle of the screen: the tabs, the words, the email form and then the two providers.
// The form checks itself here rather than through the kit's form.form handler, so its errors and status
// stay in React. The email form calls the auth API (src/lib/auth.js) and opens /dashboard once signed in.
// Google and GitHub go through src/lib/sso.js and come back to /auth/callback/<provider>.
// Password reset isn't built yet: it says so in the status line.
const COPY = {
  signup: {
    title: "Create your Eval Space account",
    lead: "Run your first suite in minutes. Free while you set up, no card needed.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchHref: "/signin",
    switchLabel: "Sign in",
  },
  signin: {
    title: "Welcome back",
    lead: "Sign in to see your runs, scores and regressions.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New to Eval Space?",
    switchHref: "/signup",
    switchLabel: "Create an account",
  },
};

const FIELDS = {
  signup: [
    { id: "name", label: "Full name", type: "text", autoComplete: "name", error: "Write your name." },
    {
      id: "email", label: "Work email", type: "email", autoComplete: "email", inputMode: "email",
      error: "Write an email address with an @, like name@company.com.",
    },
    {
      id: "password", label: "Password", type: "password", autoComplete: "new-password", minLength: 8,
      hint: "At least 8 characters.", error: "Use at least 8 characters.",
    },
  ],
  signin: [
    {
      id: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email",
      error: "Write the email address you signed up with.",
    },
    { id: "password", label: "Password", type: "password", autoComplete: "current-password", error: "Write your password." },
  ],
};


const google = (
  <svg viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

const github = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0z"
    />
  </svg>
);

// What the screen says for each API failure; anything else shows the API's own message.
function errorMessage(mode, err) {
  if (err.status === 409) return "An account with this email already exists. Sign in instead.";
  if (err.status === 401 && mode === "signin") return "Incorrect email or password.";
  if (err.status === 422) return "Check your details and try again.";
  if (err.status === 429) return err.message || "Too many sign-in attempts. Try again in a few minutes.";
  return err.message;
}

export default function AuthScreen({ mode }) {
  const copy = COPY[mode];
  const fields = FIELDS[mode];
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  // already signed in: go straight to the account page
  useEffect(() => {
    if (hasSession()) window.location.replace("/dashboard");
  }, []);

  const check = (input) => {
    const ok = input.checkValidity();
    setErrors((e) => ({ ...e, [input.name]: !ok }));
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const bad = [...form.querySelectorAll("input")].filter((input) => !check(input));
    if (bad.length) {
      setStatus(bad.length === 1 ? "1 field to fix." : `${bad.length} fields to fix.`);
      bad[0].focus();
      return;
    }

    const data = new FormData(form);
    const email = data.get("email").trim();
    const password = data.get("password");
    setPending(true);
    setStatus("");
    try {
      if (mode === "signup") await signUp({ fullName: data.get("name").trim(), email, password });
      else await signIn({ email, password });
      // a full page load, so the kit's scripts start on the new page
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load restarts the kit's scripts
      window.location.assign("/dashboard");
    } catch (err) {
      setStatus(errorMessage(mode, err));
      setPending(false);
    }
  };

  const onProvider = (provider) => {
    if (!startSso(provider)) setStatus(`Signing in with ${providerName(provider)} isn't set up yet. Use your email for now.`);
  };

  const onForgot = (e) => {
    e.preventDefault();
    setStatus("Password reset isn't live yet.");
  };

  return (
    <section className="section auth" aria-labelledby="auth-h">
      <div className="wrap auth__wrap">
          <div className="auth__panel">
            <nav className="tabs auth__tabs" aria-label="Account">
              <a className="tab" href="/signup" aria-current={mode === "signup" ? "page" : undefined}>Create account</a>
              <a className="tab" href="/signin" aria-current={mode === "signin" ? "page" : undefined}>Sign in</a>
            </nav>

            <div className="auth__head">
              {/* Create account shows only the line below; its heading stays for screen readers. */}
              <h1 id="auth-h" className={mode === "signup" ? "sr-only" : undefined}>{copy.title}</h1>
              <p className="split__lead">{copy.lead}</p>
            </div>

            <form className="auth-form" onSubmit={onSubmit} noValidate>
              {fields.map((f) => {
                const errId = `auth-${f.id}-err`;
                const hintId = `auth-${f.id}-hint`;
                return (
                  <div className="field" key={f.id}>
                    <span className="auth__label-row">
                      <label htmlFor={`auth-${f.id}`}>{f.label}</label>
                      {mode === "signin" && f.id === "password" && (
                        <a className="auth__forgot" href="#forgot" onClick={onForgot}>Forgot password?</a>
                      )}
                    </span>
                    <input
                      id={`auth-${f.id}`}
                      name={f.id}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      inputMode={f.inputMode}
                      minLength={f.minLength}
                      required
                      aria-invalid={errors[f.id] ? "true" : undefined}
                      aria-describedby={f.hint ? `${hintId} ${errId}` : errId}
                      onInput={(e) => errors[f.id] && check(e.currentTarget)}
                    />
                    {f.hint && <p className="auth__hint" id={hintId} hidden={!!errors[f.id]}>{f.hint}</p>}
                    <p className="field__error" id={errId} hidden={!errors[f.id]}>{f.error}</p>
                  </div>
                );
              })}

              <button className="btn btn--primary auth__submit" type="submit" disabled={pending} aria-busy={pending}>
                {pending ? copy.pending : copy.submit}
              </button>
              <p className="form__status" role="status">{status}</p>

              {mode === "signup" && (
                <p className="t-small muted">By creating an account you agree to the Terms and the Privacy Policy.</p>
              )}
            </form>

            <p className="auth__or"><span>or continue with</span></p>

            <div className="auth__providers">
              <button className="btn btn--secondary auth__provider" type="button" onClick={() => onProvider("google")}>
                {google}Continue with Google
              </button>
              <button className="btn btn--secondary auth__provider" type="button" onClick={() => onProvider("github")}>
                {github}Continue with GitHub
              </button>
            </div>

            <p className="t-small muted auth__switch">
              {copy.switchText} <a href={copy.switchHref}>{copy.switchLabel}</a>
            </p>
          </div>
      </div>
    </section>
  );
}
