"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authFetch } from "@/lib/authFetch";

interface Section {
  id: string;
  label: string;
  desc: string;
  emoji: string;
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: "", label: "", desc: "", emoji: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/sections");
      if (res.ok) {
        const data = await res.json();
        setSections(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: Section) => {
    setForm(section);
    setEditingId(section.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete section "${label}"? Products in this section might lose their categorization.`)) return;
    try {
      const res = await authFetch(`/api/admin/sections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSections(prev => prev.filter(s => s.id !== id));
        showToast("Section deleted");
      } else {
        showToast("Failed to delete", false);
      }
    } catch (e) {
      showToast("An error occurred", false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.label) return showToast("ID and Label are required", false);
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/sections/${editingId}` : "/api/admin/sections";
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingId) {
          setSections(prev => prev.map(s => s.id === editingId ? saved : s));
          showToast("Section updated");
        } else {
          setSections(prev => [...prev, saved]);
          showToast("Section created");
        }
        setShowModal(false);
      } else {
        showToast("Failed to save", false);
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
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Organisation</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>Product <em>Sections</em></h1>
        </div>
        <button onClick={() => { setForm({ id: "", label: "", desc: "", emoji: "📁" }); setEditingId(null); setShowModal(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c9a96e", color: "#0a0a0a", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", border: "none", cursor: "pointer" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Section
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 120, background: "#ece9e3", borderRadius: 4 }} />)}
        </div>
      ) : sections.length === 0 ? (
        <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680", background: "#fff" }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 12 }}>No sections found</div>
          <p style={{ fontSize: "13px" }}>Create a section to organize your products.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {sections.map(section => (
            <motion.div key={section.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: "#fff", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: "3px solid #c9a96e", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: "32px", lineHeight: 1 }}>{section.emoji || "📁"}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleEdit(section)} style={{ background: "none", border: "none", color: "#0a0a0a", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>Edit</button>
                  <button onClick={() => handleDelete(section.id, section.label)} style={{ background: "none", border: "none", color: "#c0392b", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 500, color: "#0a0a0a", marginBottom: 6 }}>{section.label}</div>
              <div style={{ fontSize: "13px", color: "#8a8680", marginBottom: 16 }}>{section.desc || "No description"}</div>
              <div style={{ fontSize: "10px", color: "#c9a96e", fontFamily: "monospace" }}>ID: {section.id}</div>
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
                {editingId ? "Edit Section" : "Add Section"}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Section ID (Unique)</label>
                  <input value={form.id} onChange={e => setForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))} disabled={!!editingId} placeholder="e.g. summer_collection"
                    style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: editingId ? "#f5f5f5" : "#fafaf8", fontFamily: "DM Sans, sans-serif" }} required />
                  <p style={{ fontSize: "10px", color: "#8a8680", marginTop: 4 }}>Used in URLs and filtering. Letters, numbers, hyphens, and underscores only.</p>
                </div>
                <div>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Label</label>
                  <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Summer Collection"
                    style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontFamily: "DM Sans, sans-serif" }} required />
                </div>
                <div>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Description (Optional)</label>
                  <input value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="e.g. Our hottest items for the season"
                    style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontFamily: "DM Sans, sans-serif" }} />
                </div>
                <div>
                  <label style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 6, display: "block" }}>Emoji / Icon (Optional)</label>
                  <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} placeholder="e.g. ☀️"
                    style={{ width: "100%", padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontFamily: "DM Sans, sans-serif" }} />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 24px", background: "none", border: "0.5px solid rgba(0,0,0,0.2)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: "#0a0a0a", color: "#fff", border: "none", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save Section"}</button>
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
