import { ADMIN_TOKEN_KEY, clearAdminSession } from "@/lib/adminAuth";
import { getApiUrl } from "@/lib/api";

/** fetch() for admin API calls: adds the Bearer token and logs out on 401. */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try { token = localStorage.getItem(ADMIN_TOKEN_KEY); } catch {}
  }

  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((init?.headers as Record<string, string>) || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const finalInput = typeof input === "string" ? getApiUrl(input) : input;
  const res = await fetch(finalInput, { ...init, headers });

  // Session expired or not an admin any more -> back to the login screen
  if (res.status === 401 && typeof window !== "undefined" && !location.pathname.startsWith("/admin/login")) {
    clearAdminSession();
    location.href = `/admin/login?next=${encodeURIComponent(location.pathname)}`;
  }
  return res;
}
