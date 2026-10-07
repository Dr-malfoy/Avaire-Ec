// Admin session helpers.
// The backend (Express) is the real security gate: every /api/admin/* call is checked
// there with the JWT + admin role. The cookie below only lets Next.js decide whether to
// show the admin pages or redirect to the login screen.

export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_COOKIE = "admin_token";

function decodePayload(token: string): { exp?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

/** True when the token looks like a JWT that has not expired yet. */
export function isTokenFresh(token: string | undefined | null): boolean {
  if (!token) return false;
  const payload = decodePayload(token);
  if (!payload) return false;
  return !payload.exp || payload.exp * 1000 > Date.now();
}

/** Browser only: store the token in localStorage + a cookie the middleware can read. */
export function saveAdminSession(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  const payload = decodePayload(token);
  const maxAge = payload?.exp ? Math.max(0, Math.floor(payload.exp - Date.now() / 1000)) : 60 * 60 * 24;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ADMIN_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
}

/** Browser only: remove the admin session everywhere. */
export function clearAdminSession() {
  try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
  document.cookie = `${ADMIN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`;
}
