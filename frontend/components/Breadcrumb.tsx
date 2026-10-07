"use client";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "11px",
        letterSpacing: "0.08em",
        color: "#8a8680",
        marginBottom: "32px",
        textTransform: "uppercase",
      }}
    >
      {items.map((item, i) => (
        <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {i > 0 && (
            <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "10px" }}>›</span>
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              style={{
                color: "#8a8680",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#c9a96e"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8a8680"; }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: i === items.length - 1 ? "#0a0a0a" : "#8a8680" }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
