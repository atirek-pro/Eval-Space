// Client for the FastAPI auth endpoints (apps/backend/auth/routes.py).
//
// The refresh token lives only in an httpOnly cookie set by the API: no script here, or anywhere else on the
// page, can read it. The access token is kept in memory, so it's gone on reload; the next authRequest() then
// gets a new one from /auth/refresh, where the browser attaches the cookie by itself. authRequest() also
// refreshes when the access token has expired or the API answers 401, then retries the request once.
//
// A refresh token works once, and the API ends every session when a spent one comes back. All tabs share the
// one cookie, so refreshes never run in parallel: one at a time per tab, and one at a time across tabs through a
// Web Lock.
//
// JS can't see the cookie, so a non-secret flag in localStorage records that someone is signed in. It only
// decides whether trying a refresh is worth it; on its own it grants nothing.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const SIGNED_IN_KEY = "evalspace.signedIn";
const EXPIRY_MARGIN_MS = 30_000; // refresh a little before the access token runs out

// tokens used to be kept in localStorage; drop any left from before the cookie
if (typeof window !== "undefined") localStorage.removeItem("evalspace.session");

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let access = null; // { token, expiresAt }, in memory only

function saveSession(data) {
  access = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 - EXPIRY_MARGIN_MS };
  localStorage.setItem(SIGNED_IN_KEY, "1");
  return access;
}

function clearSession() {
  access = null;
  localStorage.removeItem(SIGNED_IN_KEY);
}

export function hasSession() {
  return localStorage.getItem(SIGNED_IN_KEY) === "1";
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include", // send and store the refresh token cookie
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // FastAPI sends a string detail for our own errors and a list for validation errors
    const message = typeof data?.detail === "string" ? data.detail : "Something went wrong. Try again.";
    throw new ApiError(res.status, message);
  }
  return data;
}

let refreshInFlight = null;

function withRefreshLock(fn) {
  return typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("evalspace-refresh", fn)
    : fn();
}

// stale: the access token the caller found unusable (or null when it had none)
function refreshSession(stale) {
  refreshInFlight ??= withRefreshLock(async () => {
    // another call in this tab refreshed while we waited for the lock
    if (access && access.token !== stale?.token && Date.now() < access.expiresAt) return access;
    try {
      return saveSession(await request("/auth/refresh", { method: "POST" }));
    } catch (err) {
      if (err.status === 401) clearSession();
      throw err;
    }
  }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function authRequest(path, options = {}) {
  if (!hasSession()) throw new ApiError(401, "Not signed in");
  let session = access;
  if (!session || Date.now() >= session.expiresAt) session = await refreshSession(session);

  try {
    return await request(path, { ...options, token: session.token });
  } catch (err) {
    if (err.status !== 401) throw err;
    session = await refreshSession(session);
    return request(path, { ...options, token: session.token });
  }
}

export async function signUp({ fullName, email, password }) {
  const data = await request("/auth/signup", {
    method: "POST",
    body: { full_name: fullName, email, password },
  });
  saveSession(data);
  return data.user;
}

export async function signIn({ email, password }) {
  const data = await request("/auth/signin", { method: "POST", body: { email, password } });
  saveSession(data);
  return data.user;
}

// provider: "google" | "github"; code: what the provider sent back to /auth/callback/<provider>
export async function signInWithSso(provider, code) {
  const data = await request(`/auth/sso/${provider}`, { method: "POST", body: { code } });
  saveSession(data);
  return data.user;
}

export async function signOut() {
  clearSession();
  // the API revokes the cookie's token and deletes the cookie; if the call fails the token just expires
  await withRefreshLock(() => request("/auth/logout", { method: "POST" })).catch(() => {});
}

export function getMe() {
  return authRequest("/auth/me");
}
