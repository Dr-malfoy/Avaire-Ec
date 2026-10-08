"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { authFetch } from "@/lib/authFetch";
import { getImageUrl } from "@/lib/api";


interface AdminProduct {
  id: string; name: string; price: number; originalPrice?: number;
  section?: string; category: string; badge?: string;
  inStock: boolean; stockCount: number; images: string[]; image?: string; icon?: string;
}

interface Section {
  id: string;
  label: string;
  desc: string;
  emoji: string;
}


export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(25);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    Promise.all([
      authFetch("/api/admin/products").then(r => r.json()),
      authFetch("/api/admin/sections").then(r => r.json())
    ])
    .then(([prods, secs]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setSections(Array.isArray(secs) ? secs : []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (sectionFilter !== "all") list = list.filter(p => p.section === sectionFilter);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q)); }
    return list;
  }, [products, sectionFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await authFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) { setProducts(prev => prev.filter(p => p.id !== id)); showToast("Product deleted"); }
      else showToast("Failed to delete", false);
    } finally { setDeleting(null); }
  };

  const filterBtns = [["all", "All"], ...sections.map(s => [s.id, s.label])];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Catalogue</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>All <em>Products</em></h1>
        </div>
        <Link href="/admin/products/new" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c9a96e", color: "#0a0a0a", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <input type="text" placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 180, border: "0.5px solid rgba(0,0,0,0.15)", padding: "10px 14px", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {filterBtns.map(([val, label]) => (
            <button key={val} onClick={() => { setSectionFilter(val); setPage(1); }}
              style={{ padding: "10px 16px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", border: "0.5px solid", borderColor: sectionFilter === val ? "#0a0a0a" : "rgba(0,0,0,0.2)", background: sectionFilter === val ? "#0a0a0a" : "transparent", color: sectionFilter === val ? "#fafaf8" : "#8a8680", transition: "all 0.2s", fontFamily: "DM Sans, sans-serif" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: "12px", letterSpacing: "0.04em" }}>
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 52, background: "#ece9e3", borderRadius: 4 }} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 12 }}>No products found</div>
            <p style={{ fontSize: "13px", marginBottom: 24 }}>Try adjusting your filters or add a new product.</p>
            <Link href="/admin/products/new" style={{ background: "#c9a96e", color: "#0a0a0a", padding: "12px 28px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>Add Product</Link>
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "#fafaf8" }}>
                  {["Product", "Section", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => {
                  const rawThumb = p.images?.[0] ?? p.image;
                  const thumb = rawThumb ? getImageUrl(rawThumb) : null;
                  const sec = sections.find(s => s.id === p.section);
                  return (
                    <tr key={p.id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 44, height: 44, background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                            {thumb ? <Image src={thumb} alt={p.name} width={44} height={44} style={{ width: "100%", height: "100%", objectFit: "cover" }} unoptimized /> : <span style={{ fontSize: 20 }}>{p.icon ?? "🛍️"}</span>}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "#0a0a0a" }}>{p.name}</div>
                            <div style={{ fontSize: "11px", color: "#8a8680", marginTop: 2 }}>{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {sec ? <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: "#1e40af", background: "#dbeafe" }}>{sec.label}</span>
                          : <span style={{ color: "#8a8680", fontSize: "12px" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500 }}>
                        ৳{p.price}{p.originalPrice && <span style={{ fontSize: "11px", color: "#8a8680", textDecoration: "line-through", marginLeft: 6 }}>৳{p.originalPrice}</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "13px", fontWeight: p.stockCount < 5 ? 700 : 400, color: p.stockCount < 5 ? "#92400e" : "#0a0a0a" }}>{p.stockCount}</span>
                        {p.stockCount < 5 && <span style={{ fontSize: "10px", color: "#b45309", marginLeft: 4 }}>low</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: p.inStock && p.stockCount > 0 ? "#065f46" : "#991b1b", background: p.inStock && p.stockCount > 0 ? "#d1fae5" : "#fee2e2" }}>
                          {p.inStock && p.stockCount > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <Link href={`/admin/products/${p.id}`} style={{ fontSize: "12px", color: "#0a0a0a", textDecoration: "none", borderBottom: "0.5px solid rgba(0,0,0,0.3)", paddingBottom: 1 }}>Edit</Link>
                          <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
                            style={{ fontSize: "12px", color: "#c0392b", background: "none", border: "none", borderBottom: "0.5px solid rgba(192,57,43,0.3)", paddingBottom: 1, opacity: deleting === p.id ? 0.5 : 1 }}>
                            {deleting === p.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: "12px", color: "#8a8680" }}>Page {page} of {totalPages}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["← Prev", page - 1, page === 1], ["Next →", page + 1, page === totalPages]].map(([label, pg, disabled]) => (
                    <button key={String(label)} onClick={() => setPage(Number(pg))} disabled={Boolean(disabled)}
                      style={{ padding: "8px 16px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", border: "0.5px solid rgba(0,0,0,0.2)", background: "transparent", color: Boolean(disabled) ? "#ccc" : "#0a0a0a", opacity: Boolean(disabled) ? 0.5 : 1 }}>
                      {String(label)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`, background: toast.ok ? "#0a0a0a" : "#c0392b", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.05em", zIndex: 400, opacity: toast.show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {toast.ok ? "✓ " : "✕ "}{toast.message}
      </div>
    </motion.div>
  );
}
