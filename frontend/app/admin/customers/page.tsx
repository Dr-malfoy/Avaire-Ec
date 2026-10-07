"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { authFetch } from "@/lib/authFetch";

interface Customer { email: string; phone: string; name: string; orderCount: number; totalSpent: number; lastOrder: string; location: string; }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    authFetch("/api/admin/orders")
      .then(r => r.json())
      .then((orders: Array<{ status?: string; customer?: { name?: string; phone?: string; firstName?: string; lastName?: string; email?: string; city?: string; country?: string }; total?: number; createdAt?: string }>) => {
        if (!Array.isArray(orders)) return;
        const map = new Map<string, Customer>();
        for (const o of orders) {
          if (o.status === "Cancelled") continue;
          const email = (o.customer?.email ?? "").toLowerCase(); if (!email) continue;
          const phone = o.customer?.phone ?? "";
          const name = o.customer?.name ?? ([o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(" ") || "—");
          const location = [o.customer?.city, o.customer?.country].filter(Boolean).join(", ");
          const ex = map.get(email);
          if (ex) { if (!ex.phone && phone) ex.phone = phone; ex.orderCount++; ex.totalSpent += Number(o.total ?? 0); if (o.createdAt && o.createdAt > ex.lastOrder) ex.lastOrder = o.createdAt; }
          else map.set(email, { email, phone, name, orderCount: 1, totalSpent: Number(o.total ?? 0), lastOrder: o.createdAt ?? "", location });
        }
        setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 8 }}>CRM</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>All <em>Customers</em></h1>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ label: "Total", val: customers.length.toString() }, { label: "Revenue", val: `৳${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` }].map(s => (
            <div key={s.label} style={{ background: "#fff", padding: "16px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 300, color: "#0a0a0a" }}>{s.val}</div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#8a8680", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ background: "#fff", padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <input type="text" placeholder="Search by name, email or phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", padding: "10px 14px", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8" }} />
      </div>

      <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 12 }}>{filtered.length} {filtered.length === 1 ? "customer" : "customers"}</div>

      <div style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 52, background: "#ece9e3", borderRadius: 4 }} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 8 }}>No customers yet</div>
            <p style={{ fontSize: "13px" }}>Customers appear here once they place an order.</p>
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "#fafaf8" }}>
                  {["Customer", "Phone", "Orders", "Total Spent", "Last Order"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(c => (
                  <tr key={c.email} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "#c9a96e", fontSize: "13px", fontWeight: 600 }}>{(c.name !== "—" ? c.name : c.email).charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 500 }}>{c.name !== "—" ? c.name : c.email}</div>
                          <div style={{ fontSize: "11px", color: "#8a8680" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8a8680" }}>{c.phone ? <a href={`tel:${c.phone}`} style={{ color: "inherit" }}>{c.phone}</a> : (c.location || "—")}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#0a0a0a", color: "#fafaf8", fontSize: "12px", fontWeight: 600 }}>{c.orderCount}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600 }}>৳{Number(c.totalSpent).toFixed(2)}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8a8680" }}>
                      {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: "12px", color: "#8a8680" }}>Page {page} of {totalPages}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 16px", fontSize: "11px", border: "0.5px solid rgba(0,0,0,0.2)", background: "transparent", opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 16px", fontSize: "11px", border: "0.5px solid rgba(0,0,0,0.2)", background: "transparent", opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

