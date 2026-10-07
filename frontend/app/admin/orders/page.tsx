"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderStatus } from "@/lib/types";
import { authFetch } from "@/lib/authFetch";

interface OrderItem { name?: string; price?: number; qty?: number; size?: string; color?: string; image?: string; }
interface Order {
  id: string; _id: string; orderNumber: string;
  customer: {
    name?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    zip?: string;
    deliveryZone?: string;
    deliveryCharge?: number;
  };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  shippingFee?: number;
  shippingZone?: string;
  createdAt: string;
}

const ALL_STATUSES: OrderStatus[] = ["pending", "Processing", "Shipped", "Delivered", "Cancelled", "paid"];
const S: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#92400e", bg: "#fef3c7" },
  paid:       { label: "Paid",       color: "#1e40af", bg: "#dbeafe" },
  Processing: { label: "Processing", color: "#b45309", bg: "#fef3c7" },
  Shipped:    { label: "Shipped",    color: "#1e40af", bg: "#dbeafe" },
  Delivered:  { label: "Delivered",  color: "#065f46", bg: "#d1fae5" },
  Cancelled:  { label: "Cancelled",  color: "#991b1b", bg: "#fee2e2" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const showToast = (message: string, ok = true) => { setToast({ show: true, message, ok }); setTimeout(() => setToast(t => ({ ...t, show: false })), 3000); };

  useEffect(() => {
    authFetch("/api/admin/orders")
      .then(r => r.json())
      .then((d: Order[]) => setOrders(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) {
        setOrders(p => p.map(o => (o.id ?? o._id) === orderId ? { ...o, status: newStatus } : o));
        if ((selected?.id ?? selected?._id) === orderId) setSelected(p => p ? { ...p, status: newStatus } : null);
        showToast("Status updated");
      } else showToast("Failed to update", false);
    } finally { setUpdatingId(null); }
  };

  const cName = (o: Order) => o.customer?.name ?? ([o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(" ") || "—");

  const getDeliveryCharge = (o: Order) => {
    if (o.customer?.deliveryCharge !== undefined && o.customer?.deliveryCharge !== null) {
      return Number(o.customer.deliveryCharge);
    }
    if (o.shippingFee !== undefined && o.shippingFee !== null) {
      return Number(o.shippingFee);
    }
    const zone = (o.customer?.deliveryZone || o.shippingZone || "").toLowerCase();
    return zone.includes("outside") ? 150 : 80;
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        cName(o).toLowerCase().includes(q) ||
        (o.customer?.email ?? "").toLowerCase().includes(q) ||
        (o.customer?.phone ?? "").toLowerCase().includes(q) ||
        (o.customer?.address ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 8 }}>Management</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>All <em>Orders</em></h1>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <input type="text" placeholder="Search by order ID, customer, phone, address…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 240, border: "0.5px solid rgba(0,0,0,0.15)", padding: "10px 14px", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["all", "All"], ...Object.entries(S).map(([k, v]) => [k, v.label])].map(([val, lbl]) => (
            <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
              style={{ padding: "10px 14px", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", border: "0.5px solid", borderColor: statusFilter === val ? "#0a0a0a" : "rgba(0,0,0,0.2)", background: statusFilter === val ? "#0a0a0a" : "transparent", color: statusFilter === val ? "#fafaf8" : "#8a8680", transition: "all 0.2s", fontFamily: "DM Sans, sans-serif" }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 12 }}>{filtered.length} {filtered.length === 1 ? "order" : "orders"}</div>

      <div style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ height: 52, background: "#ece9e3", borderRadius: 4 }} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 8 }}>No orders found</div>
            <p style={{ fontSize: "13px" }}>Orders placed by customers will appear here.</p>
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "#fafaf8" }}>
                  {["Order ID", "Customer", "Delivery Address", "Items", "Total (Inc. Delivery)", "Status", "Date", "Update"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(order => {
                  const cfg = S[order.status] ?? S.pending;
                  const dCharge = getDeliveryCharge(order);
                  const zone = order.customer?.deliveryZone || (dCharge === 150 ? "Outside Dhaka" : "Inside Dhaka");
                  return (
                    <tr key={order.id ?? order._id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => setSelected(order)} style={{ fontFamily: "monospace", fontSize: "12px", color: "#c9a96e", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>{order.orderNumber}</button>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{cName(order)}</div>
                        {order.customer?.phone && <div style={{ fontSize: "12px", color: "#0a0a0a", marginTop: "2px" }}>📞 {order.customer.phone}</div>}
                        {order.customer?.email && <div style={{ fontSize: "11px", color: "#8a8680", marginTop: "1px" }}>{order.customer.email}</div>}
                      </td>
                      <td style={{ padding: "14px 16px", maxWidth: "240px" }}>
                        <div style={{ fontSize: "12px", color: "#1a1a1a", lineHeight: 1.4, wordBreak: "break-word" }}>
                          📍 {order.customer?.address || "Address not provided"}
                        </div>
                        <div style={{ display: "inline-block", marginTop: "4px", fontSize: "10px", letterSpacing: "0.05em", background: "#f5f2ec", color: "#8a8680", padding: "2px 8px", borderRadius: "2px" }}>
                          🚚 {zone} (৳{dCharge})
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8a8680" }}>{order.items.length} {order.items.length === 1 ? "item" : "items"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0a0a0a" }}>৳{Number(order.total).toFixed(2)}</div>
                        <div style={{ fontSize: "10px", color: "#8a8680", marginTop: "2px" }}>Delivery: ৳{dCharge.toFixed(2)}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8a8680" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <select value={order.status} disabled={updatingId === (order.id ?? order._id)} onChange={e => handleStatusUpdate(order.id ?? order._id, e.target.value as OrderStatus)}
                          style={{ border: "0.5px solid rgba(0,0,0,0.15)", padding: "7px 10px", fontSize: "12px", outline: "none", background: "#fafaf8", fontFamily: "DM Sans, sans-serif", appearance: "none" as const, opacity: updatingId === (order.id ?? order._id) ? 0.5 : 1 }}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{S[s]?.label ?? s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Order detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40 }} />
            <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "min(440px, 100vw)", background: "#fff", zIndex: 50, display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#c9a96e" }}>{selected.orderNumber}</div>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 300, marginTop: 2 }}>Order Details</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "18px", color: "#8a8680", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
                {/* Status & Date */}
                {(() => { const cfg = S[selected.status] ?? S.pending; return (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                    <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, padding: "6px 14px", borderRadius: 100, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    <span style={{ fontSize: "12px", color: "#8a8680" }}>{new Date(selected.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                ); })()}

                {/* Customer & Delivery Address */}
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 12 }}>Customer & Delivery Details</div>
                  <div style={{ background: "#fafaf8", padding: "16px", border: "0.5px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#0a0a0a" }}>{cName(selected)}</div>
                    {selected.customer?.phone && (
                      <div style={{ fontSize: "13px", color: "#0a0a0a" }}>
                        📞 <strong>Phone:</strong> <a href={`tel:${selected.customer.phone}`} style={{ color: "#c9a96e", textDecoration: "none", fontWeight: 500 }}>{selected.customer.phone}</a>
                      </div>
                    )}
                    {selected.customer?.email && (
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        ✉️ <strong>Email:</strong> {selected.customer.email}
                      </div>
                    )}
                    <div style={{ borderTop: "0.5px dashed rgba(0,0,0,0.15)", paddingTop: 10, marginTop: 4 }}>
                      <div style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a8680", marginBottom: 4 }}>📍 Delivery Address:</div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#0a0a0a", lineHeight: 1.5, background: "#fff", padding: "10px 12px", border: "1px solid rgba(201,169,110,0.3)" }}>
                        {selected.customer?.address || "No address entered"}
                        {selected.customer?.city ? `, ${selected.customer.city}` : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#0a0a0a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f5f2ec", padding: "8px 12px", marginTop: 4 }}>
                      <span>🚚 <strong>Delivery Zone:</strong></span>
                      <span style={{ fontWeight: 600 }}>
                        {selected.customer?.deliveryZone || (getDeliveryCharge(selected) === 150 ? "Outside Dhaka" : "Inside Dhaka")} (৳{getDeliveryCharge(selected).toFixed(2)})
                      </span>
                    </div>
                    {selected.paymentMethod && (
                      <div style={{ fontSize: "12px", color: "#8a8680" }}>
                        💳 <strong>Payment:</strong> {selected.paymentMethod}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>Ordered Items ({selected.items.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selected.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f5f2ec" }}>
                        <div style={{ width: 44, height: 44, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0, border: "0.5px solid rgba(0,0,0,0.08)" }}>
                          {item.image && item.image.length <= 2 ? item.image : "🛍️"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name ?? "Product"}</div>
                          <div style={{ fontSize: "11px", color: "#8a8680" }}>{[item.size, item.color, `Qty ${item.qty ?? 1}`].filter(Boolean).join(" · ")}</div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>৳{((item.price ?? 0) * (item.qty ?? 1)).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Breakdown */}
                {(() => {
                  const dCharge = getDeliveryCharge(selected);
                  const itemsSubtotal = selected.items.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
                  return (
                    <div style={{ background: "#fafaf8", padding: "16px", border: "0.5px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8a8680" }}>
                        <span>Items Subtotal</span>
                        <span>৳{itemsSubtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8a8680" }}>
                        <span>Delivery Charge ({selected.customer?.deliveryZone || (dCharge === 150 ? "Outside Dhaka" : "Inside Dhaka")})</span>
                        <span style={{ fontWeight: 600, color: "#0a0a0a" }}>+৳{dCharge.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 4, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                        <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "#0a0a0a" }}>Total Amount</span>
                        <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 400, color: "#0a0a0a" }}>৳{Number(selected.total).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Status update */}
                <div>
                  <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 12 }}>Update Order Status</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {ALL_STATUSES.map(s => {
                      const isActive = selected.status === s;
                      return (
                        <button key={s} disabled={isActive || updatingId === (selected.id ?? selected._id)} onClick={() => handleStatusUpdate(selected.id ?? selected._id, s)}
                          style={{ padding: 10, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", border: "0.5px solid", borderColor: isActive ? "#0a0a0a" : "rgba(0,0,0,0.2)", background: isActive ? "#0a0a0a" : "transparent", color: isActive ? "#fafaf8" : "#0a0a0a", opacity: updatingId === (selected.id ?? selected._id) ? 0.6 : 1, transition: "all 0.2s", fontFamily: "DM Sans, sans-serif", cursor: isActive ? "default" : "pointer" }}>
                          {S[s]?.label ?? s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`, background: toast.ok ? "#0a0a0a" : "#c0392b", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.05em", zIndex: 400, opacity: toast.show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {toast.ok ? "✓ " : "✕ "}{toast.message}
      </div>
    </motion.div>
  );
}
