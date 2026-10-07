const PROD_API_URL = "https://official.aviar.wearm3s.com";
const LOCAL_API_URL = "http://localhost:5000";

export function getApiBaseUrl(): string {
  // Browser runtime check
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API_URL;
    }
    // Any production domain (e.g. shop.aviar.wearm3s.com)
    return PROD_API_URL;
  }

  // Server-side runtime check
  if (process.env.NODE_ENV === "production") {
    return PROD_API_URL;
  }

  return process.env.NEXT_PUBLIC_API_URL || LOCAL_API_URL;
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
