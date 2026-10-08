"use client";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ProductSection } from "@/lib/types";
import { authFetch } from "@/lib/authFetch";

interface Section {
  id: string;
  label: string;
  desc: string;
  emoji: string;
}
const SIZE_PRESETS = [
  { group: "Standard", sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "Free Size", "One Size"] },
  { group: "Waist / Numeric", sizes: ["26", "28", "30", "32", "34", "36", "38", "40", "42", "44"] },
  { group: "Footwear", sizes: ["37", "38", "39", "40", "41", "42", "43", "44", "45", "46"] },
];
const CATS = ["Clothing", "Accessories", "Home", "Shoes", "Bags"];

interface Img { preview: string; url: string; uploading: boolean; error: boolean; }

const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", padding: "13px 14px", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8", color: "#0a0a0a" };
const inpErr: React.CSSProperties = { ...inp, borderColor: "#c0392b" };
const card: React.CSSProperties = { background: "#fff", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 };
const label: React.CSSProperties = { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "16px", display: "block" };

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", originalPrice: "", stockCount: "0", inStock: true, category: "Clothing", sizes: [] as string[], colors: [] as string[], colorInput: "", section: "" });
  const [sizeInput, setSizeInput] = useState("");
  const [images, setImages] = useState<Img[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ show: false, message: "", ok: true });
  const [dragging, setDragging] = useState(false);

  // Section management inline
  const [secModal, setSecModal] = useState(false);
  const [secForm, setSecForm] = useState({ id: "", label: "", desc: "", emoji: "" });
  const [secEditing, setSecEditing] = useState<string | null>(null);
  const [secSaving, setSecSaving] = useState(false);

  const showToast = (message: string, ok = true) => { setToast({ show: true, message, ok }); setTimeout(() => setToast(t => ({ ...t, show: false })), 3500); };

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = () => {
    authFetch("/api/admin/sections")
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(console.error);
  };

  const openAddSection = () => {
    setSecForm({ id: "", label: "", desc: "", emoji: "" });
    setSecEditing(null);
    setSecModal(true);
  };

  const openEditSection = (sec: Section) => {
    setSecForm({ id: sec.id, label: sec.label, desc: sec.desc, emoji: sec.emoji });
    setSecEditing(sec.id);
    setSecModal(true);
  };

  const deleteSection = async (sec: Section) => {
    if (!confirm(`Delete section "${sec.label}"?`)) return;
    const res = await authFetch(`/api/admin/sections/${sec.id}`, { method: "DELETE" });
    if (res.ok) {
      setSections(prev => prev.filter(s => s.id !== sec.id));
      if (form.section === sec.id) setForm(p => ({ ...p, section: "" }));
      showToast("Section deleted");
    } else showToast("Failed to delete", false);
  };

  const saveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secForm.id || !secForm.label) return showToast("ID and Label required", false);
    setSecSaving(true);
    try {
      const method = secEditing ? "PUT" : "POST";
      const url = secEditing ? `/api/admin/sections/${secEditing}` : "/api/admin/sections";
      const res = await authFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(secForm) });
      if (res.ok) {
        showToast(secEditing ? "Section updated" : "Section created");
        setSecModal(false);
        loadSections();
      } else showToast("Failed to save", false);
    } finally { setSecSaving(false); }
  };

  const addCustomSize = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!form.sizes.includes(trimmed)) {
      setForm(p => ({ ...p, sizes: [...p.sizes, trimmed] }));
    }
    setSizeInput("");
  };

  const toggleSize = (s: string) => {
    setForm(p => ({
      ...p,
      sizes: p.sizes.includes(s) ? p.sizes.filter(x => x !== s) : [...p.sizes, s]
    }));
  };

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append("file", file); fd.append("section", form.section || "collection");
    const res = await authFetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    return ((await res.json()) as { url: string }).url;
  }, [form.section]);

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const toAdd = Array.from(files).slice(0, 15 - images.length);
    if (!toAdd.length) return;
    const newItems: Img[] = toAdd.map(f => ({ preview: URL.createObjectURL(f), url: "", uploading: true, error: false }));
    setImages(prev => [...prev, ...newItems]);
    await Promise.all(toAdd.map(async (file, i) => {
      const idx = images.length + i;
      try { const url = await uploadFile(file); setImages(prev => prev.map((img, j) => j === idx ? { ...img, url, uploading: false } : img)); }
      catch { setImages(prev => prev.map((img, j) => j === idx ? { ...img, uploading: false, error: true } : img)); }
    }));
  }, [images.length, uploadFile]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || Number(form.price) <= 0) e.price = "Required";
    if (!images.filter(i => i.url).length) e.images = "At least one image required";
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const urls = images.filter(i => i.url).map(i => i.url);
      const chosenSection = form.section || (sections.length > 0 ? sections[0].id : "collection");
      const res = await authFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          category: form.category,
          section: chosenSection,
          sizes: form.sizes,
          colors: form.colors,
          stockCount: Number(form.stockCount),
          inStock: form.inStock,
          images: urls,
          image: urls[0] ?? "",
          badge: chosenSection === "sale" ? "sale" : chosenSection === "new_arrival" ? "new" : null
        })
      });
      if (res.ok) { showToast("Product saved!"); setTimeout(() => router.push("/admin/products"), 1200); }
      else showToast("Failed to save", false);
    } catch { showToast("An error occurred", false); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: "40px 40px 80px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/products" style={{ fontSize: "12px", color: "#8a8680", textDecoration: "none", letterSpacing: "0.06em" }}>← Back to Products</Link>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginTop: 16, marginBottom: 8 }}>Products</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>Add New <em>Product</em></h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "24px", alignItems: "start" }}>
        {/* Left */}
        <div>
          {/* Images */}
          <div style={card}>
            <span style={label}>Product Images ({images.length})</span>
            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1", background: "#f5f2ec", overflow: "hidden" }}>
                    {img.preview && <Image src={img.preview} alt="" fill style={{ objectFit: "cover" }} unoptimized />}
                    {img.uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div>}
                    {img.error && <div style={{ position: "absolute", inset: 0, background: "rgba(192,57,43,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "white", fontSize: "11px" }}>Failed</span></div>}
                    {img.url && !img.uploading && <div style={{ position: "absolute", top: 4, left: 4, width: 16, height: 16, background: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg></div>}
                    <button onClick={() => setImages(p => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, background: "rgba(0,0,0,0.7)", color: "white", border: "none", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 20 && (
              <label onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${errors.images ? "#c0392b" : dragging ? "#c9a96e" : "rgba(0,0,0,0.15)"}`, padding: "32px 16px", textAlign: "center", background: dragging ? "rgba(201,169,110,0.04)" : "transparent", transition: "all 0.2s", cursor: "pointer" }}>
                <div style={{ fontSize: "28px", marginBottom: 10 }}>📸</div>
                <div style={{ fontSize: "13px", color: "#0a0a0a", marginBottom: 4 }}>Drag & drop images here</div>
                <div style={{ fontSize: "12px", color: "#8a8680", marginBottom: 8 }}>or click to browse</div>
                <div style={{ fontSize: "11px", color: "#8a8680" }}>PNG, JPG, WebP · High resolution supported</div>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
              </label>
            )}
            {errors.images && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 8 }}>{errors.images}</p>}
          </div>

          {/* Section */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ ...label, marginBottom: 0, color: errors.section ? "#c0392b" : "#8a8680" }}>Section {errors.section && `— ${errors.section}`}</span>
              <button type="button" onClick={openAddSection}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", background: "#0a0a0a", color: "#fafaf8", border: "none", padding: "6px 12px", cursor: "pointer" }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                New Section
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {sections.map(sec => (
                <div key={sec.id} style={{ position: "relative" }}>
                  <button type="button" onClick={() => { setForm(p => ({ ...p, section: sec.id })); setErrors(e => ({ ...e, section: "" })); }}
                    style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 8px 24px", border: `2px solid ${form.section === sec.id ? "#c9a96e" : "rgba(0,0,0,0.12)"}`, background: form.section === sec.id ? "rgba(201,169,110,0.06)" : "transparent", transition: "all 0.2s", cursor: "pointer" }}>
                    <span style={{ fontSize: "24px" }}>{sec.emoji}</span>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#0a0a0a" }}>{sec.label}</div>
                    <div style={{ fontSize: "10px", color: "#8a8680" }}>{sec.desc}</div>
                  </button>
                  {/* Edit / Delete row */}
                  <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
                    <button type="button" onClick={e => { e.stopPropagation(); openEditSection(sec); }}
                      style={{ fontSize: "9px", padding: "2px 7px", background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer", letterSpacing: "0.05em", color: "#0a0a0a", borderRadius: 2 }}>Edit</button>
                    <button type="button" onClick={e => { e.stopPropagation(); deleteSection(sec); }}
                      style={{ fontSize: "9px", padding: "2px 7px", background: "rgba(192,57,43,0.08)", border: "none", cursor: "pointer", letterSpacing: "0.05em", color: "#c0392b", borderRadius: 2 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Basic Info */}
          <div style={card}>
            <span style={label}>Basic Information</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input placeholder="Product Name *" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }} style={errors.name ? inpErr : inp} />
                {errors.name && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 4 }}>{errors.name}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <input type="number" placeholder="Price (৳) *" value={form.price} min="0" step="0.01" onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(er => ({ ...er, price: "" })); }} style={errors.price ? inpErr : inp} />
                  {errors.price && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 4 }}>{errors.price}</p>}
                </div>
                <input type="number" placeholder="Original Price (৳)" value={form.originalPrice} min="0" step="0.01" onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} style={inp} />
              </div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp, appearance: "none" as const }}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={card}>
            <span style={label}>Description</span>
            <textarea placeholder="Product description…" value={form.description} rows={4} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inp, resize: "vertical" as const }} />
          </div>

          <div style={card}>
            <span style={label}>Inventory</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input type="number" placeholder="Stock Count" value={form.stockCount} min="0" onChange={e => setForm(p => ({ ...p, stockCount: e.target.value }))} style={inp} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "0.5px solid rgba(0,0,0,0.15)", padding: "13px 14px", background: "#fafaf8" }}>
                <span style={{ fontSize: "13px" }}>In Stock</span>
                <button type="button" onClick={() => setForm(p => ({ ...p, inStock: !p.inStock }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: form.inStock ? "#c9a96e" : "rgba(0,0,0,0.15)", border: "none", position: "relative", transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", top: 2, left: 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "transform 0.2s", transform: form.inStock ? "translateX(20px)" : "none", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ ...label, marginBottom: 0 }}>Sizes ({form.sizes.length} selected)</span>
              {form.sizes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, sizes: [] }))}
                  style={{ background: "none", border: "none", fontSize: "11px", color: "#8a8680", cursor: "pointer", textDecoration: "underline" }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Custom Size Input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                placeholder="Custom size (e.g. 3XL, 34W, 42 EU, Custom Fit)"
                value={sizeInput}
                onChange={e => setSizeInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSize(sizeInput);
                  }
                }}
                style={{ ...inp, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => addCustomSize(sizeInput)}
                style={{ padding: "0 18px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.06em", cursor: "pointer" }}
              >
                Add Size
              </button>
            </div>

            {/* Selected Sizes Chips */}
            {form.sizes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: "10px", color: "#8a8680", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Selected Sizes:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {form.sizes.map(size => (
                    <span
                      key={size}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#0a0a0a", color: "#fafaf8", padding: "6px 12px", fontSize: "12px" }}
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => toggleSize(size)}
                        style={{ background: "none", border: "none", color: "#fafaf8", fontSize: "14px", cursor: "pointer", padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Presets */}
            <div>
              <div style={{ fontSize: "10px", color: "#8a8680", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Quick Presets:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SIZE_PRESETS.map(preset => (
                  <div key={preset.group}>
                    <div style={{ fontSize: "10px", color: "#8a8680", marginBottom: 4 }}>{preset.group}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {preset.sizes.map(size => {
                        const isSelected = form.sizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              border: isSelected ? "1px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)",
                              background: isSelected ? "#0a0a0a" : "transparent",
                              color: isSelected ? "#fafaf8" : "#0a0a0a",
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={card}>
            <span style={label}>Colors</span>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input placeholder="Add color (e.g. Ivory)" value={form.colorInput} onChange={e => setForm(p => ({ ...p, colorInput: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const c = form.colorInput.trim(); if (c && !form.colors.includes(c)) setForm(p => ({ ...p, colors: [...p.colors, c], colorInput: "" })); } }}
                style={{ ...inp, flex: 1 }} />
              <button type="button" onClick={() => { const c = form.colorInput.trim(); if (c && !form.colors.includes(c)) setForm(p => ({ ...p, colors: [...p.colors, c], colorInput: "" })); }}
                style={{ padding: "0 20px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.06em" }}>Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.colors.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f2ec", padding: "6px 10px", fontSize: "12px" }}>
                  {c}
                  <button onClick={() => setForm(p => ({ ...p, colors: p.colors.filter(x => x !== c) }))} style={{ background: "none", border: "none", color: "#8a8680", fontSize: "14px", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Link href="/admin/products" style={{ padding: "13px 28px", border: "0.5px solid rgba(0,0,0,0.2)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", color: "#0a0a0a" }}>Cancel</Link>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "13px 40px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Section Modal */}
      {secModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSecModal(false)}>
          <div style={{ background: "#fff", padding: "32px", width: "100%", maxWidth: 440, position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", fontWeight: 300, marginBottom: 24 }}>
              {secEditing ? "Edit" : "New"} <em>Section</em>
            </div>
            <form onSubmit={saveSection}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                <input
                  placeholder="ID (e.g. new_arrival) *"
                  value={secForm.id}
                  disabled={!!secEditing}
                  onChange={e => setSecForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  style={{ ...inp, opacity: secEditing ? 0.5 : 1 }}
                />
                <input
                  placeholder="Label (e.g. New Arrival) *"
                  value={secForm.label}
                  onChange={e => setSecForm(p => ({ ...p, label: e.target.value }))}
                  style={inp}
                />
                <input
                  placeholder="Description (e.g. Latest drops)"
                  value={secForm.desc}
                  onChange={e => setSecForm(p => ({ ...p, desc: e.target.value }))}
                  style={inp}
                />
                <input
                  placeholder="Emoji (e.g. ✨)"
                  value={secForm.emoji}
                  onChange={e => setSecForm(p => ({ ...p, emoji: e.target.value }))}
                  style={inp}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setSecModal(false)}
                  style={{ padding: "11px 20px", border: "0.5px solid rgba(0,0,0,0.2)", background: "transparent", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={secSaving}
                  style={{ padding: "11px 28px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", opacity: secSaving ? 0.6 : 1 }}>
                  {secSaving ? "Saving…" : secEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`, background: toast.ok ? "#0a0a0a" : "#c0392b", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.05em", zIndex: 400, opacity: toast.show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {toast.ok ? "✓ " : "✕ "}{toast.message}
      </div>
    </motion.div>
  );
}

