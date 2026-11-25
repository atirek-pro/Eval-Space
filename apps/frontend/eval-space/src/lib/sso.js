// Google and GitHub sign-in, browser side.
//
// startSso() sends the person to the provider with a random one-time `state`, kept in sessionStorage.
// The provider sends them back to /auth/callback/<provider>?code=…&state=…; takeSsoCallback() checks that
// state matches the one this tab stored (so nobody can push their own code into someone else's browser)
// and hands back the code, which the callback page posts to the API (signInWithSso in auth.js).
// The redirect URI must match the backend's GOOGLE_REDIRECT_URI / GITHUB_REDIRECT_URI exactly.

const PROVIDERS = {
  google: {
    name: "Google",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    params: { response_type: "code", scope: "openid email profile", prompt: "select_account" },
  },
  github: {
    name: "GitHub",
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    authorizeUrl: "https://github.com/login/oauth/authorize",
    params: { scope: "user:email" }, // the public profile needs no scope; user:email reads the verified email
  },
};

const STATE_KEY = "evalspace.sso";

export function providerName(provider) {
  return PROVIDERS[provider]?.name ?? provider;
}

export function redirectUri(provider) {
  return `${window.location.origin}/auth/callback/${provider}`;
}

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Sends the browser to the provider. Returns false (and goes nowhere) when the provider isn't set up. */
export function startSso(provider) {
  const p = PROVIDERS[provider];
  if (!p?.clientId) return false;

  const state = randomState();
  sessionStorage.setItem(STATE_KEY, JSON.stringify({ provider, state }));
  const query = new URLSearchParams({
    client_id: p.clientId,
    redirect_uri: redirectUri(provider),
    state,
    ...p.params,
  });
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- the provider's own site, not ours
  window.location.assign(`${p.authorizeUrl}?${query}`);
  return true;
}

/**
 * Reads the provider's answer from the current URL, once. Returns { code } on success or { error } with a
 * message to show. Clears the stored state and the code from the address bar either way.
 */
export function takeSsoCallback(provider) {
  const params = new URLSearchParams(window.location.search);
  const stored = JSON.parse(sessionStorage.getItem(STATE_KEY) || "null");
  sessionStorage.removeItem(STATE_KEY);
  window.history.replaceState(null, "", window.location.pathname);

  const name = providerName(provider);
  if (params.get("error")) {
    return {
      error: params.get("error") === "access_denied"
        ? `You cancelled signing in with ${name}.`
        : `${name} couldn't sign you in. Try again.`,
    };
  }
  const code = params.get("code");
  if (!code || !stored || stored.provider !== provider || stored.state !== params.get("state")) {
    return { error: "This sign-in link has expired or wasn't started here. Try again." };
  }
  return { code };
}
