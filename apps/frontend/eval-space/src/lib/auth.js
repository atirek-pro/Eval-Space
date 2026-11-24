// Client for the FastAPI auth endpoints (apps/backend/routes.py).
//
// The session (both tokens and when the access token expires) is kept in localStorage. Requests that need a
// signed-in user go through authRequest(): when the access token has expired, or the API answers 401, it gets a
// new pair from /auth/refresh and retries the request once. A refresh token works only once and the API ends
// every session when a spent one comes back, so refreshes are never run in parallel: one at a time per tab, and
// one at a time across tabs through a Web Lock, re-reading the stored session inside it so a tab that waited
// uses the pair another tab just got.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const STORAGE_KEY = "evalspace.session";
const EXPIRY_MARGIN_MS = 30_000; // refresh a little before the access token runs out

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveSession(tokens) {
  const session = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessExpiresAt: Date.now() + tokens.expires_in * 1000 - EXPIRY_MARGIN_MS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSession() {
  return Boolean(loadSession()?.refreshToken);
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

function refreshSession(staleRefreshToken) {
  refreshInFlight ??= withRefreshLock(async () => {
    const current = loadSession();
    if (!current?.refreshToken) throw new ApiError(401, "Not signed in");
    if (current.refreshToken !== staleRefreshToken) return current; // another tab already refreshed
    try {
      return saveSession(
        await request("/auth/refresh", { method: "POST", body: { refresh_token: current.refreshToken } })
      );
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
  let session = loadSession();
  if (!session?.refreshToken) throw new ApiError(401, "Not signed in");
  if (Date.now() >= session.accessExpiresAt) session = await refreshSession(session.refreshToken);

  try {
    return await request(path, { ...options, token: session.accessToken });
  } catch (err) {
    if (err.status !== 401) throw err;
    session = await refreshSession(session.refreshToken);
    return request(path, { ...options, token: session.accessToken });
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

export async function signOut() {
  const session = loadSession();
  clearSession();
  if (session?.refreshToken) {
    // the session is already gone locally; a failed call only leaves the token to expire on its own
    await request("/auth/logout", { method: "POST", body: { refresh_token: session.refreshToken } }).catch(() => {});
  }
}

export function getMe() {
  return authRequest("/auth/me");
}
