const DEFAULT_PROD_API_URL = "https://official.aviar.wearm3s.com";
const DEFAULT_LOCAL_API_URL = "http://localhost:5000";

export function getApiBaseUrl(): string {
  // If explicitly configured via environment variable, always respect it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Browser runtime check
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return DEFAULT_LOCAL_API_URL;
    }
    // Any production domain
    return DEFAULT_PROD_API_URL;
  }

  // Server-side runtime check
  if (process.env.NODE_ENV === "production") {
    return process.env.BACKEND_INTERNAL_URL || DEFAULT_PROD_API_URL;
  }

  return DEFAULT_LOCAL_API_URL;
}

export function getApiUrl(path: string): string {
  if (!path) return getApiBaseUrl();
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function getImageUrl(src?: string | null): string {
  if (!src) return "";
  const s = String(src).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:") || s.startsWith("blob:")) {
    return s;
  }
  if (s.startsWith("/api/") || s.startsWith("api/")) {
    return getApiUrl(s);
  }
  return s.startsWith("/") ? s : `/${s}`;
}



