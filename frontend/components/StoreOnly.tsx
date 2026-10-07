"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders its children on the storefront only — hidden inside the admin panel. */
export default function StoreOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
