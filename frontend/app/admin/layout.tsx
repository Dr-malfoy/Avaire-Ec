"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { authFetch } from "@/lib/authFetch";
import { clearAdminSession } from "@/lib/adminAuth";

type BadgeKey = "pendingOrders" | "unreadChats" | "abandoned";
type Badges = Record<BadgeKey, number>;

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: BadgeKey;
  /** extra paths that should also highlight this item */
  match?: (path: string) => boolean;
}

const ICONS: Record<string, ReactNode> = {
  "/admin/dashboard": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
  ),
  "/admin/products": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
  ),
  "/admin/products/new": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
  ),
  "/admin/storefront": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
  ),
  "/admin/sections": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
  ),
  "/admin/orders": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
      </svg>
  ),
  "/admin/customers": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
  ),
  "/admin/abandoned": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        <line x1="17" y1="10" x2="17" y2="14" /><line x1="17" y1="16" x2="17" y2="16.5" />
      </svg>
  ),
  "/admin/coupons": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21.5 12H16c-.7 2-3 3-4.5 1.5S10 9 12 8.5c2-1 4 2 4 2" />
        <path d="M2 12h20M7 5l-2 14" />
      </svg>
  ),
  "/admin/chat": (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
  )
};

// ─── Menu, grouped by what the admin is doing ───────────────────────────────
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: ICONS["/admin/dashboard"] }],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ICONS["/admin/orders"], badge: "pendingOrders" },
      { href: "/admin/customers", label: "Customers", icon: ICONS["/admin/customers"] },
      { href: "/admin/abandoned", label: "Abandoned Carts", icon: ICONS["/admin/abandoned"], badge: "abandoned" },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        href: "/admin/products",
        label: "All Products",
        icon: ICONS["/admin/products"],
        match: (p) => p === "/admin/products" || (p.startsWith("/admin/products/") && p !== "/admin/products/new"),
      },
      { href: "/admin/products/new", label: "Add Product", icon: ICONS["/admin/products/new"], match: (p) => p === "/admin/products/new" },
      { href: "/admin/sections", label: "Sections", icon: ICONS["/admin/sections"] },
      { href: "/admin/coupons", label: "Coupons", icon: ICONS["/admin/coupons"] },
    ],
  },
  {
    title: "Website",
    items: [{ href: "/admin/storefront", label: "Storefront", icon: ICONS["/admin/storefront"] }],
  },
  {
    title: "Support",
    items: [{ href: "/admin/chat", label: "Live Chat", icon: ICONS["/admin/chat"], badge: "unreadChats" }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
const MOBILE_TABS = ["/admin/dashboard", "/admin/orders", "/admin/products", "/admin/chat"];

const isActive = (item: NavItem, path: string) => (item.match ? item.match(path) : path === item.href || path.startsWith(item.href + "/"));

const SIDEBAR_W = 248;

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span style={{ marginLeft: "auto", minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10, background: "#c9a96e", color: "#0a0a0a", fontSize: "10px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

function Sidebar({ badges, adminName, onClose, onLogout }: { badges: Badges; adminName: string; onClose?: () => void; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div style={{ width: SIDEBAR_W, background: "#0a0a0a", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <div style={{ padding: "24px", borderBottom: "0.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/admin/dashboard" onClick={onClose} style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginTop: "3px" }}>Admin Panel</div>
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "18px", padding: "4px" }}>✕</button>
        )}
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 6 }}>
            <div style={{ padding: "14px 24px 6px", fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
              {group.title}
            </div>
            {group.items.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className="admin-nav-link"
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 24px", fontSize: "13px", letterSpacing: "0.04em", textDecoration: "none",
                    color: active ? "#c9a96e" : "rgba(255,255,255,0.6)",
                    background: active ? "rgba(255,255,255,0.05)" : "transparent",
                    borderLeft: active ? "2px solid #c9a96e" : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && <Badge n={badges[item.badge]} />}
                </Link>
              );
            })}
          </div>
        ))}

        <div style={{ margin: "12px 24px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }} />
        <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link"
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 24px", fontSize: "13px", letterSpacing: "0.04em", textDecoration: "none", color: "rgba(255,255,255,0.45)", borderLeft: "2px solid transparent" }}>
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View Store ↗
        </a>
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "18px 24px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#c9a96e", fontSize: "12px", fontWeight: 600 }}>{adminName.charAt(0).toUpperCase() || "A"}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fafaf8", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminName}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>AVIAR Store</div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ width: "100%", background: "none", border: "0.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", padding: "10px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
          Logout
        </button>
      </div>
    </div>
  );
}

function MobileBottomNav({ badges, onMore }: { badges: Badges; onMore: () => void }) {
  const pathname = usePathname();
  const tabs = MOBILE_TABS.map((h) => ALL_ITEMS.find((i) => i.href === h)!).filter(Boolean);
  const moreActive = !tabs.some((t) => isActive(t, pathname));

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "9px 2px", color: active ? "#c9a96e" : "rgba(255,255,255,0.45)", textDecoration: "none",
    fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase", gap: "4px", position: "relative",
    background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
  });

  return (
    <nav className="admin-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "0.5px solid rgba(255,255,255,0.1)", zIndex: 40, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map((item) => {
        const n = item.badge ? badges[item.badge] : 0;
        return (
          <Link key={item.href} href={item.href} style={tabStyle(isActive(item, pathname))}>
            {item.icon}
            {item.label.replace("All ", "")}
            {n > 0 && <span style={{ position: "absolute", top: 5, left: "calc(50% + 6px)", minWidth: 16, height: 16, borderRadius: 8, background: "#c9a96e", color: "#0a0a0a", fontSize: "9px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{n > 99 ? "99+" : n}</span>}
          </Link>
        );
      })}
      <button onClick={onMore} style={tabStyle(moreActive)} aria-label="Open full menu">
        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
        </svg>
        More
      </button>
    </nav>
  );
}

// Layout-level responsive rules (no JS needed, so no layout flash on load)
const ADMIN_CSS = `
  .admin-desktop-sidebar { display: none; }
  .admin-mobile-bar { display: flex; }
  .admin-bottom-nav { display: flex; }
  .admin-main { margin-left: 0; padding-bottom: 72px; }
  .admin-nav-link:hover { color: #fafaf8 !important; background: rgba(255,255,255,0.04); }
  @media (min-width: 1024px) {
    .admin-desktop-sidebar { display: block; }
    .admin-mobile-bar, .admin-bottom-nav { display: none !important; }
    .admin-main { margin-left: ${SIDEBAR_W}px; padding-bottom: 0; }
  }
  /* Pages use roomy desktop padding; tighten it on phones */
  @media (max-width: 767px) {
    .admin-main > div:first-of-type { padding-left: 16px !important; padding-right: 16px !important; padding-top: 24px !important; }
    .admin-main h1 { font-size: 30px !important; }
  }
`;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [badges, setBadges] = useState<Badges>({ pendingOrders: 0, unreadChats: 0, abandoned: 0 });
  const [adminName, setAdminName] = useState("Admin");
  const isLogin = pathname === "/admin/login";

  // Close drawer when navigating
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const loadBadges = useCallback(() => {
    authFetch("/api/admin/badges")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setBadges({ pendingOrders: d.pendingOrders ?? 0, unreadChats: d.unreadChats ?? 0, abandoned: d.abandoned ?? 0 }); })
      .catch(() => {});
  }, []);

  // Refresh badges on every page change and every 30 s
  useEffect(() => {
    if (isLogin) return;
    loadBadges();
    const t = setInterval(loadBadges, 30000);
    return () => clearInterval(t);
  }, [isLogin, pathname, loadBadges]);

  useEffect(() => {
    if (isLogin) return;
    authFetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.name) setAdminName(d.name); })
      .catch(() => {});
  }, [isLogin]);

  const handleLogout = async () => {
    clearAdminSession();
    fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  };

  if (isLogin) return <>{children}</>;

  const current = ALL_ITEMS.find((i) => isActive(i, pathname));

  return (
    <div data-admin="true" style={{ minHeight: "100vh", background: "#f4f4f2" }}>
      <style>{ADMIN_CSS}</style>

      {/* Desktop fixed sidebar */}
      <aside className="admin-desktop-sidebar" style={{ width: SIDEBAR_W, position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 40 }}>
        <Sidebar badges={badges} adminName={adminName} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 55 }} />
          <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 60 }}>
            <Sidebar badges={badges} adminName={adminName} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </div>
        </>
      )}

      <main className="admin-main" style={{ minWidth: 0 }}>
        {/* Mobile top bar */}
        <header className="admin-mobile-bar" style={{ position: "sticky", top: 0, zIndex: 30, background: "#0a0a0a", padding: "0 12px 0 16px", height: 56, alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</span>
            {current && <span style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{current.label}</span>}
          </div>
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: "8px" }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {children}
      </main>

      <MobileBottomNav badges={badges} onMore={() => setDrawerOpen(true)} />
    </div>
  );
}
