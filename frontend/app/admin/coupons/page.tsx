"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/authFetch";

interface Coupon {
  code: string;
  discountType: "percent" | "fixed" | "shipping";
  discountValue: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<Coupon>({ code: "", discountType: "percent", discountValue: 10, isActive: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setForm(coupon);
    setEditingCode(coupon.code);
    setShowModal(true);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/coupons/${code}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.code !== code));
        showToast("Coupon deleted");
      } else {
        showToast("Failed to delete", false);
      }
    } catch (e) {
      showToast("An error occurred", false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) return showToast("Coupon code is required", false);
    setSaving(true);
    try {
      const method = editingCode ? "PUT" : "POST";
      const url = editingCode ? `/api/admin/coupons/${editingCode}` : "/api/admin/coupons";
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, code: form.code.toUpperCase() })
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingCode) {
          setCoupons(prev => prev.map(c => c.code === editingCode ? saved : c));
          showToast("Coupon updated");
        } else {
          setCoupons(prev => [...prev, saved]);
          showToast("Coupon created");
        }
        setShowModal(false);
      } else {
        showToast("Failed to save. Code may already exist.", false);
      }
    } catch (e) {
      showToast("An error occurred", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Marketing</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>Discount <em>Coupons</em></h1>
        </div>
        <button onClick={() => { setForm({ code: "", discountType: "percent", discountValue: 10, isActive: true }); setEditingCode(null); setShowModal(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c9a96e", color: "#0a0a0a", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", border: "none", cursor: "pointer" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Coupon
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 120, background: "#ece9e3", borderRadius: 4 }} />)}
        </div>
      ) : coupons.length === 0 ? (
        <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680", background: "#fff" }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 12 }}>No coupons found</div>
          <p style={{ fontSize: "13px" }}>Create a discount code for your customers.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {coupons.map(coupon => (
            <motion.div key={coupon.code} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: "#fff", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${coupon.isActive ? "#c9a96e" : "#8a8680"}`, position: "relative", opacity: coupon.isActive ? 1 : 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "0.1em", color: "#0a0a0a" }}>{coupon.code}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleEdit(coupon)} style={{ background: "none", border: "none", color: "#0a0a0a", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => handleDelete(coupon.code)} style={{ background: "none", border: "none", color: "#c0392b", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize: "16px", color: "#c9a96e", marginBottom: 16 }}>
                {coupon.discountType === 'percent' ? `${coupon.discountValue}% OFF` : coupon.discountType === 'fixed' ? `৳${coupon.discountValue} OFF` : 'FREE SHIPPING'}
              </div>
              <div style={{ fontSize: "10px", color: coupon.isActive ? "#2ecc71" : "#e74c3c", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "bold" }}>
                {coupon.isActive ? "ACTIVE" : "INACTIVE"}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", padding: "32px", width: "100%", maxWidth: 480, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 300, marginBottom: 24 }}>
                {editingCode ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Coupon Code</label>
                  <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }))} disabled={!!editingCode} placeholder="e.g. SUMMER20"
                    style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: editingCode ? "#f5f5f5" : "#fafaf8", fontFamily: "DM Sans, sans-serif" }} required />
                </div>
                <div>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))}
                    style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontFamily: "DM Sans, sans-serif" }}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
                {form.discountType !== 'shipping' && (
                  <div>
                    <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Discount Value</label>
                    <input type="number" step="0.01" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: Number(e.target.value) }))} placeholder="e.g. 20"
                      style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontFamily: "DM Sans, sans-serif" }} required />
                  </div>
                )}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "#0a0a0a" }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                    Coupon is Active
                  </label>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 24px", background: "none", border: "0.5px solid rgba(0,0,0,0.2)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: "#0a0a0a", color: "#fff", border: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save Coupon"}</button>
                </div>
              </form>
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

