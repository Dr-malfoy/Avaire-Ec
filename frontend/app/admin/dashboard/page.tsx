"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { OrderStatus } from "@/lib/types";
import { authFetch } from "@/lib/authFetch";

interface RecentOrder {
  id: string; orderNumber: string;
  customer: { name?: string; phone?: string; email?: string } | null;
  total: number; status: OrderStatus; createdAt: string;
  items: { name?: string }[];
}
interface LowStockProduct { id: string; name: string; stockCount: number; price: number; inStock?: boolean; }
interface DashboardData {
  totalRevenue: number; monthRevenue: number; todayRevenue: number;
  totalOrders: number; todayOrders: number; pendingOrders: number;
  totalProducts: number; outOfStock: number;
  totalCustomers: number; newCustomers: number;
  unreadChats: number; abandonedCount: number;
  statusCounts: Record<string, number>;
  last7: { date: string; revenue: number; orders: number }[];
  recentOrders: RecentOrder[];
  lowStock: LowStockProduct[];
}

const S: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#92400e", bg: "#fef3c7" },
  paid:       { label: "Paid",       color: "#1e40af", bg: "#dbeafe" },
  Processing: { label: "Processing", color: "#b45309", bg: "#fef3c7" },
  Shipped:    { label: "Shipped",    color: "#1e40af", bg: "#dbeafe" },
  Delivered:  { label: "Delivered",  color: "#065f46", bg: "#d1fae5" },
  Cancelled:  { label: "Cancelled",  color: "#991b1b", bg: "#fee2e2" },
};

const taka = (n: number, digits = 0) =>
  `৳${(Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const card: React.CSSProperties = { background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };
const heading: React.CSSProperties = { fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 300 };
const skeleton = (h: number) => <div style={{ height: h, background: "#ece9e3", borderRadius: 4 }} />;

// ─── 7-day revenue: single series, so no legend — the title names it ────────
function RevenueBars({ days }: { days: DashboardData["last7"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.revenue));
  const H = 140;

  return (
    <div style={{ position: "relative" }}>
      <div role="img" aria-label="Revenue for the last 7 days" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: H, borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
        {days.map((d, i) => {
          const h = d.revenue > 0 ? Math.max(3, (d.revenue / max) * (H - 8)) : 0;
          return (
            <div key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
              style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", cursor: "default", outline: "none" }}>
              <div style={{ width: "min(28px, 70%)", height: h, background: hover === null || hover === i ? "#c9a96e" : "rgba(201,169,110,0.45)", borderRadius: "4px 4px 0 0", transition: "background 0.15s, height 0.4s" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
        {days.map((d, i) => (
          <div key={d.date} style={{ flex: 1, textAlign: "center", fontSize: "10px", color: i === days.length - 1 ? "#0a0a0a" : "#8a8680", letterSpacing: "0.04em" }}>
            {i === days.length - 1 ? "Today" : new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
          </div>
        ))}
      </div>
      {hover !== null && days[hover] && (
        <div style={{ position: "absolute", top: -6, left: `${((hover + 0.5) / days.length) * 100}%`, transform: "translate(-50%, -100%)", background: "#0a0a0a", color: "#fafaf8", padding: "8px 10px", fontSize: "11px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 2 }}>
          <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
            {new Date(days[hover].date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
          <div style={{ fontWeight: 600 }}>{taka(days[hover].revenue)}</div>
          <div style={{ color: "rgba(255,255,255,0.6)" }}>{days[hover].orders} order{days[hover].orders === 1 ? "" : "s"}</div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    authFetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: DashboardData) => setData(d))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Revenue this month", value: data ? taka(data.monthRevenue) : "—", sub: data ? `${taka(data.totalRevenue)} all time` : "", href: "/admin/orders" },
    { label: "Orders today", value: data ? String(data.todayOrders) : "—", sub: data ? `${data.totalOrders} all time · ${taka(data.todayRevenue)} today` : "", href: "/admin/orders" },
    { label: "Customers", value: data ? String(data.totalCustomers) : "—", sub: data ? `${data.newCustomers} new this month` : "", href: "/admin/customers" },
    { label: "Products", value: data ? String(data.totalProducts) : "—", sub: data ? `${data.outOfStock} out of stock` : "", href: "/admin/products" },
  ];

  // "Needs attention" — only shown when there is something to do
  const todo = data ? [
    { n: data.pendingOrders, text: "new order", plural: "new orders", action: "waiting to be confirmed", href: "/admin/orders" },
    { n: data.unreadChats, text: "chat", plural: "chats", action: "with unread messages", href: "/admin/chat" },
    { n: data.abandonedCount, text: "abandoned cart", plural: "abandoned carts", action: "to follow up", href: "/admin/abandoned" },
    { n: data.outOfStock, text: "product", plural: "products", action: "out of stock", href: "/admin/products" },
  ].filter((t) => t.n > 0) : [];

  const weekRevenue = data?.last7?.reduce((s, d) => s + d.revenue, 0) ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .dash-main { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
        .dash-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important; }
        @media (max-width: 1200px) { .dash-stats { grid-template-columns: repeat(2, 1fr); } .dash-main { grid-template-columns: 1fr; } }
        @media (max-width: 520px) { .dash-stats { grid-template-columns: 1fr 1fr; gap: 10px; } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Dashboard</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>
            {greeting()}, <em>Admin</em>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/products/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c9a96e", color: "#0a0a0a", padding: "12px 18px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", fontWeight: 600 }}>
            + Add Product
          </Link>
          <Link href="/admin/storefront" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "0.5px solid rgba(0,0,0,0.25)", color: "#0a0a0a", padding: "12px 18px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
            Edit Homepage
          </Link>
        </div>
      </div>

      {failed && (
        <div style={{ padding: "14px 18px", background: "#fff0f0", border: "0.5px solid #c0392b", color: "#c0392b", fontSize: "13px", marginBottom: 24 }}>
          Could not load dashboard data. Make sure the backend server is running, then refresh.
        </div>
      )}

      {/* Needs attention */}
      {todo.length > 0 && (
        <div style={{ ...card, padding: "18px 22px", marginBottom: 24, borderLeft: "3px solid #c9a96e" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>Needs your attention</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
            {todo.map((t) => (
              <Link key={t.href + t.text} href={t.href} style={{ fontSize: "13px", color: "#0a0a0a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ minWidth: 24, height: 24, padding: "0 6px", borderRadius: 12, background: "#0a0a0a", color: "#fafaf8", fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{t.n}</span>
                <span>{t.n === 1 ? t.text : t.plural} {t.action} <span style={{ color: "#c9a96e" }}>→</span></span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="dash-stats">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.06 }}>
            <Link href={stat.href} className="dash-stat" style={{ ...card, display: "block", padding: "22px 20px", borderBottom: "3px solid #c9a96e", textDecoration: "none", color: "inherit", transition: "transform 0.2s, box-shadow 0.2s", height: "100%" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "10px" }}>{stat.label}</div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "34px", fontWeight: 300, color: "#0a0a0a", marginBottom: "6px", lineHeight: 1.1 }}>
                {loading ? <span style={{ display: "inline-block", width: 80, height: 30, background: "#ece9e3", borderRadius: 4 }} /> : stat.value}
              </div>
              <div style={{ fontSize: "11px", color: "#8a8680" }}>{loading ? "" : stat.sub}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="dash-main">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          {/* Revenue chart */}
          <div style={{ ...card, padding: "22px 26px 20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
              <div style={heading}>Revenue · last 7 days</div>
              <div style={{ fontSize: "13px", color: "#0a0a0a", fontWeight: 600 }}>{loading ? "" : taka(weekRevenue)}</div>
            </div>
            {loading ? skeleton(160) : data?.last7?.length ? <RevenueBars days={data.last7} /> : <p style={{ fontSize: 13, color: "#8a8680" }}>No data yet.</p>}
          </div>

          {/* Recent orders */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
              <div style={heading}>Recent Orders</div>
              <Link href="/admin/orders" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid rgba(0,0,0,0.2)", padding: "8px 14px", textDecoration: "none", color: "#0a0a0a" }}>View All</Link>
            </div>
            {loading ? (
              <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 10 }}>{[0, 1, 2, 3].map((i) => <div key={i}>{skeleton(44)}</div>)}</div>
            ) : !data?.recentOrders?.length ? (
              <div style={{ padding: "50px 26px", textAlign: "center", color: "#8a8680" }}>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: 8 }}>No orders yet</div>
                <p style={{ fontSize: "13px" }}>Orders will appear here once customers check out.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                  <thead>
                    <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
                      {["Order", "Customer", "Total", "Status", "Date"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => {
                      const cfg = S[order.status] ?? S.pending;
                      return (
                        <tr key={order.id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#b8924a" }}>{order.orderNumber}</td>
                          <td style={{ padding: "14px 16px", fontSize: "13px" }}>
                            <div>{order.customer?.name || order.customer?.email || "—"}</div>
                            {order.customer?.phone && <div style={{ fontSize: "11px", color: "#8a8680" }}>{order.customer.phone}</div>}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500 }}>{taka(order.total, 2)}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8a8680", whiteSpace: "nowrap" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          {/* Orders by status */}
          <div style={{ ...card, padding: "22px 24px" }}>
            <div style={{ ...heading, fontSize: "20px", marginBottom: 16 }}>Orders by Status</div>
            {loading ? skeleton(150) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((k) => (
                  <Link key={k} href="/admin/orders" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "#0a0a0a", fontSize: "13px", padding: "6px 0", borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: S[k].color }} />
                      {S[k].label}
                    </span>
                    <span style={{ fontWeight: 600 }}>{data?.statusCounts?.[k] ?? 0}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Low stock */}
          <div style={{ ...card, padding: "22px 24px" }}>
            <div style={{ ...heading, fontSize: "20px", marginBottom: 16 }}>Low Stock Alerts</div>
            {loading ? skeleton(130) : !data?.lowStock?.length ? (
              <p style={{ fontSize: "13px", color: "#8a8680" }}>All products are well stocked.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.lowStock.map((p) => {
                  const out = p.stockCount <= 0 || p.inStock === false;
                  return (
                    <Link key={p.id} href={`/admin/products/${p.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 12px", background: out ? "#fff5f5" : "#fffbeb", border: `0.5px solid ${out ? "#fecaca" : "#fde68a"}`, textDecoration: "none" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#0a0a0a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#8a8680", marginTop: 2 }}>{taka(p.price)}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: out ? "#991b1b" : "#92400e" }}>{out ? "Out" : `${p.stockCount} left`}</div>
                        <div style={{ fontSize: "10px", color: out ? "#991b1b" : "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>{out ? "⚠ Restock" : "Low"}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
