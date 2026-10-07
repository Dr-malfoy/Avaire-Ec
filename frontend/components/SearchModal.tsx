// components/SearchModal.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  slug: string;
  icon: string;
}

const FALLBACK_PRODUCTS: SearchProduct[] = [
  { id: "1", name: "Silk Wrap Blouse", price: 295, category: "Clothing", slug: "silk-wrap-blouse", icon: "👚" },
  { id: "2", name: "Cashmere Turtleneck", price: 450, category: "Clothing", slug: "cashmere-turtleneck", icon: "🧥" },
  { id: "3", name: "Leather Crossbody", price: 320, category: "Accessories", slug: "leather-crossbody", icon: "👜" },
  { id: "4", name: "Tailored Trousers", price: 250, category: "Clothing", slug: "tailored-trousers", icon: "👖" },
  { id: "5", name: "Gold Plated Cuff", price: 180, category: "Accessories", slug: "gold-plated-cuff", icon: "✨" },
  { id: "6", name: "Ceramic Vase", price: 120, category: "Home", slug: "ceramic-vase", icon: "🏺" },
  { id: "7", name: "Linen Lounge Set", price: 210, category: "Clothing", slug: "linen-lounge-set", icon: "👘" },
  { id: "8", name: "Woven Sun Hat", price: 95, category: "Accessories", slug: "woven-sun-hat", icon: "👒" },
];

const POPULAR_SEARCHES = ["Silk Blouse", "Cashmere", "Leather Bag", "Trousers", "Accessories"];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<SearchProduct[]>(FALLBACK_PRODUCTS);
  const [isDesktop, setIsDesktop] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Load products from API once on mount
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = (data as Record<string, unknown>[]).map((p) => ({
            id: String(p._id ?? p.id ?? ""),
            name: String(p.name ?? ""),
            price: Number(p.price ?? 0),
            category: String(p.category ?? ""),
            slug: String(p.slug ?? ""),
            icon: String(p.icon ?? "🛍️"),
          }));
          setAllProducts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const results = query.length > 1
    ? allProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const t = setTimeout(() => {
      if (isOpen) inputRef.current?.focus();
      else setQuery("");
    }, isOpen ? 100 : 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#fafaf8", zIndex: 201, padding: isDesktop ? "32px 48px 40px" : "20px 20px 28px", maxHeight: "100vh", overflowY: "auto" }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e" }}>Search</div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#8a8680" }}>✕</button>
            </div>

            {/* Input */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #0a0a0a", paddingBottom: "16px", marginBottom: "32px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8680" strokeWidth="1.5" style={{ flexShrink: 0, marginRight: "16px" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                style={{ flex: 1, border: "none", background: "none", fontSize: isDesktop ? "24px" : "18px", fontFamily: "Cormorant Garamond, serif", fontWeight: 300, color: "#0a0a0a", outline: "none", minWidth: 0 }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8680", fontSize: "16px" }}>✕</button>
              )}
            </div>

            {/* Results */}
            {query.length > 1 ? (
              <div>
                {results.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "16px" }}>🔍</div>
                    <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: "8px", color: "#0a0a0a" }}>
                      No results for &quot;{query}&quot;
                    </div>
                    <p style={{ fontSize: "13px", color: "#8a8680", marginBottom: "24px" }}>Try different keywords or browse our collections</p>
                    <Link href="/shop" onClick={onClose} style={{ textDecoration: "none", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#0a0a0a", borderBottom: "0.5px solid #0a0a0a" }}>
                      Browse All
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8680", marginBottom: "16px" }}>
                      {results.length} result{results.length !== 1 ? "s" : ""}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "1fr", gap: "12px" }}>
                      {results.map((product) => (
                        <Link key={product.id} href={`/product/${product.slug}`} onClick={onClose} style={{ textDecoration: "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", border: "0.5px solid rgba(0,0,0,0.08)", transition: "border-color 0.2s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#c9a96e")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.08)")}
                          >
                            <div style={{ width: "48px", height: "48px", background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                              {product.icon}
                            </div>
                            <div>
                              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "15px", color: "#0a0a0a", marginBottom: "2px" }}>{product.name}</div>
                              <div style={{ fontSize: "11px", color: "#8a8680" }}>{product.category} · ৳{product.price}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8680", marginBottom: "16px" }}>Popular Searches</div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {POPULAR_SEARCHES.map((term) => (
                    <button key={term} onClick={() => setQuery(term)}
                      style={{ padding: "8px 16px", border: "0.5px solid rgba(0,0,0,0.15)", background: "none", fontSize: "12px", letterSpacing: "0.08em", cursor: "pointer", color: "#0a0a0a", transition: "border-color 0.2s", fontFamily: "DM Sans, sans-serif" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a96e")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.15)")}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
