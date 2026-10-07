"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
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
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const CATS = ["Clothing", "Accessories", "Home", "Shoes", "Bags"];

interface Img { preview: string; url: string; uploading: boolean; error: boolean; }

const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", padding: "13px 14px", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8", color: "#0a0a0a" };
const card: React.CSSProperties = { background: "#fff", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 };
const lbl: React.CSSProperties = { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "16px", display: "block" };

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState({ name: "", description: "", price: "", originalPrice: "", stockCount: "0", inStock: true, category: "Clothing", sizes: [] as string[], colors: [] as string[], colorInput: "", section: "" });
  const [sections, setSections] = useState<Section[]>([]);
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ show: false, message: "", ok: true });
  const [dragging, setDragging] = useState(false);

  const showToast = (message: string, ok = true) => { setToast({ show: true, message, ok }); setTimeout(() => setToast(t => ({ ...t, show: false })), 3500); };

  useEffect(() => {
    authFetch("/api/admin/sections")
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!id || id === "undefined") return;
    authFetch(`/api/admin/products/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((p: Record<string, unknown>) => {
        setForm({ name: String(p.name ?? ""), description: String(p.description ?? ""), price: String(p.price ?? ""), originalPrice: p.originalPrice ? String(p.originalPrice) : "", stockCount: String(p.stockCount ?? 0), inStock: Boolean(p.inStock ?? true), category: String(p.category ?? "Clothing"), sizes: Array.isArray(p.sizes) ? p.sizes as string[] : [], colors: Array.isArray(p.colors) ? p.colors as string[] : [], colorInput: "", section: String(p.section ?? "") });
        const imgs: string[] = Array.isArray(p.images) ? p.images as string[] : [];
        if (!imgs.length && p.image) imgs.push(String(p.image));
        setImages(imgs.map(url => ({ preview: url, url, uploading: false, error: false })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append("file", file); fd.append("section", form.section || "collection");
    const res = await authFetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    return ((await res.json()) as { url: string }).url;
  }, [form.section]);

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const toAdd = Array.from(files).slice(0, 5 - images.length); if (!toAdd.length) return;
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
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const urls = images.filter(i => i.url).map(i => i.url);
      const res = await authFetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, description: form.description, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null, category: form.category, section: form.section || null, sizes: form.sizes, colors: form.colors, stockCount: Number(form.stockCount), inStock: form.inStock, images: urls, image: urls[0] ?? "" }) });
      if (res.ok) { showToast("Product updated!"); setTimeout(() => router.push("/admin/products"), 1200); }
      else showToast("Failed to save", false);
    } catch { showToast("An error occurred", false); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: 12 }}>
      {[...Array(8)].map((_, i) => <div key={i} style={{ height: 48, background: "#ece9e3", borderRadius: 4 }} />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: "40px 40px 80px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/products" style={{ fontSize: "12px", color: "#8a8680", textDecoration: "none" }}>← Back to Products</Link>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginTop: 16, marginBottom: 8 }}>Products</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300 }}>Edit <em>Product</em></h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "start" }}>
        {/* Left */}
        <div>
          <div style={card}>
            <span style={lbl}>Images {images.length}/5</span>
            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1", background: "#f5f2ec", overflow: "hidden" }}>
                    {img.preview && <Image src={img.preview} alt="" fill style={{ objectFit: "cover" }} unoptimized />}
                    {img.uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /></div>}
                    <button onClick={() => setImages(p => p.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, background: "rgba(0,0,0,0.7)", color: "white", border: "none", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 5 && (
              <label onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${dragging ? "#c9a96e" : "rgba(0,0,0,0.15)"}`, padding: "24px 16px", textAlign: "center", background: dragging ? "rgba(201,169,110,0.04)" : "transparent", transition: "all 0.2s" }}>
                <div style={{ fontSize: "24px", marginBottom: 8 }}>📸</div>
                <div style={{ fontSize: "12px", color: "#8a8680" }}>Drop images or click to browse</div>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
              </label>
            )}
          </div>

          <div style={card}>
            <span style={lbl}>Section</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {sections.map(sec => (
                <button key={sec.id} type="button" onClick={() => setForm(p => ({ ...p, section: sec.id }))}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", border: `2px solid ${form.section === sec.id ? "#c9a96e" : "rgba(0,0,0,0.12)"}`, background: form.section === sec.id ? "rgba(201,169,110,0.06)" : "transparent", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "22px" }}>{sec.emoji}</span>
                  <div style={{ fontSize: "11px", fontWeight: 500 }}>{sec.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <div style={card}>
            <span style={lbl}>Basic Information</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input placeholder="Product Name *" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }} style={errors.name ? { ...inp, borderColor: "#c0392b" } : inp} />
                {errors.name && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 4 }}>{errors.name}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <input type="number" placeholder="Price (৳) *" value={form.price} min="0" step="0.01" onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(er => ({ ...er, price: "" })); }} style={errors.price ? { ...inp, borderColor: "#c0392b" } : inp} />
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
            <span style={lbl}>Description</span>
            <textarea placeholder="Product description…" value={form.description} rows={4} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inp, resize: "vertical" as const }} />
          </div>

          <div style={card}>
            <span style={lbl}>Inventory</span>
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
            <span style={lbl}>Sizes</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SIZES.map(size => (
                <button key={size} type="button" onClick={() => setForm(p => ({ ...p, sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size] }))}
                  style={{ padding: "8px 14px", fontSize: "12px", border: form.sizes.includes(size) ? "1px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)", background: form.sizes.includes(size) ? "#0a0a0a" : "transparent", color: form.sizes.includes(size) ? "#fafaf8" : "#0a0a0a", transition: "all 0.15s" }}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <span style={lbl}>Colors</span>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input placeholder="Add color" value={form.colorInput} onChange={e => setForm(p => ({ ...p, colorInput: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const c = form.colorInput.trim(); if (c && !form.colors.includes(c)) setForm(p => ({ ...p, colors: [...p.colors, c], colorInput: "" })); } }} style={{ ...inp, flex: 1 }} />
              <button type="button" onClick={() => { const c = form.colorInput.trim(); if (c && !form.colors.includes(c)) setForm(p => ({ ...p, colors: [...p.colors, c], colorInput: "" })); }} style={{ padding: "0 20px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px" }}>Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.colors.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f2ec", padding: "6px 10px", fontSize: "12px" }}>
                  {c}<button onClick={() => setForm(p => ({ ...p, colors: p.colors.filter(x => x !== c) }))} style={{ background: "none", border: "none", color: "#8a8680", fontSize: "14px", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Link href="/admin/products" style={{ padding: "13px 28px", border: "0.5px solid rgba(0,0,0,0.2)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", color: "#0a0a0a" }}>Cancel</Link>
            <button onClick={handleSave} disabled={saving} style={{ padding: "13px 40px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`, background: toast.ok ? "#0a0a0a" : "#c0392b", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", zIndex: 400, opacity: toast.show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {toast.ok ? "✓ " : "✕ "}{toast.message}
      </div>
    </motion.div>
  );
}
