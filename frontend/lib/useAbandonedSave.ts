"use client";
import { useEffect, useRef } from "react";

interface AbandonedItem {
  id?: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  image?: string;
  category?: string;
}

interface SaveParams {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zip?: string;
  items: AbandonedItem[];
  total: number;
  source: "checkout" | "buy-now";
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("aviar_session");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("aviar_session", id);
  }
  return id;
}

export function useAbandonedSave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(false);

  const save = (params: SaveParams) => {
    const email = params.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (params.items.length === 0) return;

    // Debounce — wait 1.5 s after last keystroke before saving
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetch("/api/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          customer: {
            name: params.name,
            phone: params.phone,
            email,
            address: params.address,
            city: params.city,
            country: params.country,
            zip: params.zip,
          },
          items: params.items,
          total: params.total,
          source: params.source,
        }),
      }).catch(() => null); // Fire-and-forget, never block the user
      savedRef.current = true;
    }, 1500);
  };

  // Clear timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { save };
}
