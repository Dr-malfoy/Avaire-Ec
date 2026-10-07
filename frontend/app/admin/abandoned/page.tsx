"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/authFetch";

interface AbandonedItem {
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  image?: string;
}

interface AbandonedRecord {
  _id: string;
  customer: { name?: string; email: string; phone?: string; city?: string; country?: string };
  items: AbandonedItem[];
  total: number;
  source: "checkout" | "buy-now";
  status: "abandoned" | "contacted" | "recovered";
  createdAt: string;
  updatedAt: string;
}

const STATUS_CFG = {
  abandoned:  { label: "Abandoned",  color: "#991b1b", bg: "#fee2e2" },
  contacted:  { label: "Contacted",  color: "#92400e", bg: "#fef3c7" },
  recovered:  { label: "Recovered",  color: "#065f46", bg: "#d1fae5" },
};

const SOURCE_CFG = {
  checkout:  { label: "Checkout",  color: "#1e40af", bg: "#dbeafe" },
  "buy-now": { label: "Buy Now",   color: "#5b21b6", bg: "#ede9fe" },
};

export default function AbandonedPage() {
  const [records, setRecords] = useState<AbandonedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<AbandonedRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, msg: "", ok: true });

  const showToast = (msg: string, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    authFetch("/api/admin/abandoned")
      .then((r) => r.json())
      .then((d: AbandonedRecord[]) => { if (Array.isArray(d)) setRecords(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = records;
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.customer.email.toLowerCase().includes(q) ||
        (r.customer.name ?? "").toLowerCase().includes(q) ||
        (r.customer.phone ?? "").includes(q)
      );
    }
    return list;
  }, [records, statusFilter, search]);

  const stats = useMemo(() => ({
    total: records.length,
    totalValue: records.reduce((s, r) => s + r.total, 0),
    abandoned: records.filter((r) => r.status === "abandoned").length,
    recovered: records.filter((r) => r.status === "recovered").length,
  }), [records]);

  const handleStatus = async (id: string, status: string) => {
    setActionLoading(id + status);
    try {
      const res = await authFetch(`/api/admin/abandoned/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRecords((prev) => prev.map((r) => r._id === id ? { ...r, status: status as AbandonedRecord["status"] } : r));
        if (selected?._id === id) setSelected((s) => s ? { ...s, status: status as AbandonedRecord["status"] } : s);
        showToast(`Marked as ${status}`);
      } else showToast("Failed to update", false);
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setActionLoading(id + "del");
    try {
      const res = await authFetch(`/api/admin/abandoned/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r._id !== id));
        if (selected?._id === id) setSelected(null);
        showToast("Record deleted");
      } else showToast("Failed to delete", false);
    } finally { setActionLoading(null); }
  };

  const statCards = [
    { label: "Total Abandoned",   value: stats.total.toString(),                                           sub: "All time" },
    { label: "Value at Risk",     value: `৳${stats.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, sub: "Potential revenue" },
    { label: "Awaiting Action",   value: stats.abandoned.toString(),                                        sub: "Need follow-up" },
    { label: "Recovered",         value: stats.recovered.toString(),                                        sub: "Completed purchase" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 8 }}>Recovery</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>
          Abandoned <em>Checkouts</em>
        </h1>
        <p style={{ fontSize: "13px", color: "#8a8680", marginTop: 8 }}>
          Customers who filled in their details but didn&apos;t complete their order.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: "#fff", padding: "24px 20px", borderBottom: "3px solid #c9a96e", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "32px", fontWeight: 300, color: "#0a0a0a", marginBottom: 4 }}>
              {loading ? <span style={{ display: "inline-block", width: 60, height: 28, background: "#ece9e3", borderRadius: 4 }} /> : s.value}
            </div>
            <div style={{ fontSize: "11px", color: "#8a8680" }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <input
          type="text" placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, border: "0.5px solid rgba(0,0,0,0.15)", padding: "10px 14px", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8" }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {[["all","All"], ["abandoned","Abandoned"], ["contacted","Contacted"], ["recovered","Recovered"]].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              style={{ padding: "10px 14px", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", border: "0.5px solid", borderColor: statusFilter === v ? "#0a0a0a" : "rgba(0,0,0,0.2)", background: statusFilter === v ? "#0a0a0a" : "transparent", color: statusFilter === v ? "#fafaf8" : "#8a8680", fontFamily: "DM Sans, sans-serif" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? "record" : "records"}
      </div>

      {/* Table + Drawer */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Table */}
        <div style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(5)].map((_, i) => <div key={i} style={{ height: 52, background: "#ece9e3", borderRadius: 4 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680" }}>
              <div style={{ fontSize: "40px", marginBottom: 16 }}>🛒</div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", marginBottom: 8 }}>
                {records.length === 0 ? "No abandoned checkouts yet" : "No results match your filter"}
              </div>
              <p style={{ fontSize: "13px" }}>
                {records.length === 0
                  ? "When customers fill in their email during checkout but don't complete the order, they'll appear here."
                  : "Try a different filter or search term."}
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "#fafaf8" }}>
                  {["Customer", "Items", "Total", "Source", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const sc = STATUS_CFG[r.status];
                  const src = SOURCE_CFG[r.source];
                  const isSelected = selected?._id === r._id;
                  return (
                    <tr key={r._id}
                      onClick={() => setSelected(isSelected ? null : r)}
                      style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)", cursor: "pointer", background: isSelected ? "rgba(201,169,110,0.05)" : "transparent", transition: "background 0.15s" }}>
                      {/* Customer */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ color: "#c9a96e", fontSize: "13px", fontWeight: 600 }}>
                              {(r.customer.name || r.customer.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{r.customer.name || "—"}</div>
                            <div style={{ fontSize: "11px", color: "#8a8680" }}>{r.customer.email}</div>
                            {r.customer.phone && <div style={{ fontSize: "11px", color: "#8a8680" }}>{r.customer.phone}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Items */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "13px", color: "#0a0a0a" }}>{r.items.length} {r.items.length === 1 ? "item" : "items"}</div>
                        <div style={{ fontSize: "11px", color: "#8a8680" }}>{r.items.slice(0, 2).map((i) => i.name).join(", ")}{r.items.length > 2 ? "…" : ""}</div>
                      </td>
                      {/* Total */}
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600 }}>৳{r.total.toFixed(2)}</td>
                      {/* Source */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, padding: "3px 8px", borderRadius: 100, color: src.color, background: src.bg }}>{src.label}</span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, padding: "3px 8px", borderRadius: 100, color: sc.color, background: sc.bg }}>{sc.label}</span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8a8680" }}>
                        {new Date(r.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {r.status !== "contacted" && r.status !== "recovered" && (
                            <button
                              onClick={() => handleStatus(r._id, "contacted")}
                              disabled={!!actionLoading}
                              style={{ fontSize: "11px", padding: "5px 10px", background: "#fef3c7", color: "#92400e", border: "0.5px solid rgba(146,64,14,0.2)", cursor: "pointer", borderRadius: 4 }}>
                              Contact
                            </button>
                          )}
                          {r.status !== "recovered" && (
                            <button
                              onClick={() => handleStatus(r._id, "recovered")}
                              disabled={!!actionLoading}
                              style={{ fontSize: "11px", padding: "5px 10px", background: "#d1fae5", color: "#065f46", border: "0.5px solid rgba(6,95,70,0.2)", cursor: "pointer", borderRadius: 4 }}>
                              Recovered
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r._id)}
                            disabled={actionLoading === r._id + "del"}
                            style={{ fontSize: "11px", padding: "5px 10px", background: "#fee2e2", color: "#991b1b", border: "0.5px solid rgba(153,27,27,0.2)", cursor: "pointer", borderRadius: 4 }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25 }}
              style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: 24 }}
            >
              {/* Drawer header */}
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 300 }}>Customer Detail</div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#8a8680" }}>✕</button>
              </div>

              <div style={{ padding: "24px" }}>
                {/* Customer info */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201,169,110,0.12)", border: "1px solid rgba(201,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <span style={{ color: "#c9a96e", fontSize: "18px", fontWeight: 600 }}>
                      {(selected.customer.name || selected.customer.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {selected.customer.name && (
                    <div style={{ fontSize: "16px", fontWeight: 500, color: "#0a0a0a", marginBottom: 4 }}>{selected.customer.name}</div>
                  )}
                  <a href={`mailto:${selected.customer.email}`}
                    style={{ fontSize: "13px", color: "#c9a96e", textDecoration: "none", borderBottom: "0.5px solid rgba(201,169,110,0.4)" }}>
                    {selected.customer.email}
                  </a>
                  {selected.customer.phone && (
                    <a href={`tel:${selected.customer.phone}`} style={{ display: "block", fontSize: "13px", color: "#0a0a0a", marginTop: 4 }}>📞 {selected.customer.phone}</a>
                  )}
                  {(selected.customer.city || selected.customer.country) && (
                    <div style={{ fontSize: "12px", color: "#8a8680", marginTop: 6 }}>
                      📍 {[selected.customer.city, selected.customer.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>

                {/* Status + Source badges */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: STATUS_CFG[selected.status].color, background: STATUS_CFG[selected.status].bg }}>
                    {STATUS_CFG[selected.status].label}
                  </span>
                  <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: SOURCE_CFG[selected.source].color, background: SOURCE_CFG[selected.source].bg }}>
                    {SOURCE_CFG[selected.source].label}
                  </span>
                </div>

                {/* Items */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 14 }}>Items in Cart</div>
                  {selected.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#0a0a0a" }}>{item.name}</div>
                        <div style={{ fontSize: "11px", color: "#8a8680", marginTop: 2 }}>
                          {[item.color, item.size ? `Size ${item.size}` : null, `Qty ${item.qty}`].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>৳{(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, fontWeight: 600 }}>
                    <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8a8680" }}>Total</span>
                    <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px" }}>৳{selected.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 24, padding: "12px 16px", background: "#fafaf8", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>🕐 Abandoned: {new Date(selected.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  <div>🔄 Last seen: {new Date(selected.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>

                {/* Quick action buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a href={`mailto:${selected.customer.email}?subject=Your AVIAR order&body=Hi ${selected.customer.name ?? "there"}, we noticed you left something behind...`}
                    onClick={() => handleStatus(selected._id, "contacted")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#c9a96e", color: "#0a0a0a", padding: "13px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", fontWeight: 600 }}>
                    ✉ Send Recovery Email
                  </a>
                  {selected.status !== "recovered" && (
                    <button onClick={() => handleStatus(selected._id, "recovered")}
                      style={{ background: "#d1fae5", color: "#065f46", border: "0.5px solid rgba(6,95,70,0.2)", padding: "12px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                      ✓ Mark as Recovered
                    </button>
                  )}
                  <button onClick={() => handleDelete(selected._id)}
                    style={{ background: "none", color: "#c0392b", border: "0.5px solid rgba(192,57,43,0.25)", padding: "12px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
                    Delete Record
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`, background: toast.ok ? "#0a0a0a" : "#c0392b", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.05em", zIndex: 400, opacity: toast.show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {toast.ok ? "✓ " : "✕ "}{toast.msg}
      </div>
    </motion.div>
  );
}

