// components/ProductDetail.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRecentlyViewed } from "@/lib/useRecentlyViewed";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ProductNotFound from "@/components/ProductNotFound";
import type { ProductBadge } from "@/lib/types";
import { getImageUrl } from "@/lib/api";

interface DetailProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  image: string | null;
  icon: string;
  category: string;
  badge: ProductBadge | null;
  description: string;
  sizes: string[];
  colors: string[];
  stockCount?: number;
  inStock?: boolean;
}

// Fallback sample products used when DB returns nothing
const SAMPLE_PRODUCTS: DetailProduct[] = [
  { id: "1", slug: "cashmere-wrap", name: "Cashmere Wrap", price: 245, originalPrice: null, images: [], image: null, icon: "🧥", category: "clothing", badge: "new", description: "Luxuriously soft cashmere wrap, perfect for any occasion. Hand-finished edges and a relaxed drape make this an essential layering piece.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Ivory", "Camel", "Black"] },
  { id: "2", slug: "leather-tote", name: "Leather Tote", price: 385, originalPrice: null, images: [], image: null, icon: "👜", category: "accessories", badge: null, description: "Full-grain leather tote with a structured silhouette. Spacious interior with suede lining and gold-tone hardware.", sizes: ["One Size"], colors: ["Tan", "Black", "Burgundy"] },
  { id: "3", slug: "linen-blazer", name: "Linen Blazer", price: 310, originalPrice: 420, images: [], image: null, icon: "👔", category: "clothing", badge: "sale", description: "Tailored linen blazer with a relaxed fit. Breathable fabric perfect for warm weather dressing.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Sand", "White", "Navy"] },
  { id: "4", slug: "silk-wrap-blouse", name: "Silk Wrap Blouse", price: 295, originalPrice: null, images: [], image: null, icon: "👚", category: "clothing", badge: "new", description: "Elegant silk wrap blouse with a flattering silhouette. Perfect for both formal and casual occasions.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Blush", "Black"] },
  { id: "5", slug: "cashmere-turtleneck", name: "Cashmere Turtleneck", price: 450, originalPrice: null, images: [], image: null, icon: "🧥", category: "clothing", badge: null, description: "Premium cashmere turtleneck with a refined fit. Exceptionally soft and warm for cooler seasons.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Ivory", "Grey", "Navy"] },
  { id: "6", slug: "leather-crossbody", name: "Leather Crossbody", price: 320, originalPrice: 400, images: [], image: null, icon: "👜", category: "accessories", badge: "sale", description: "Compact leather crossbody bag with adjustable strap and gold hardware.", sizes: ["One Size"], colors: ["Tan", "Black"] },
  { id: "7", slug: "tailored-trousers", name: "Tailored Trousers", price: 250, originalPrice: null, images: [], image: null, icon: "👖", category: "clothing", badge: null, description: "Perfectly tailored trousers with a straight leg cut. Versatile and sophisticated.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Camel", "Navy"] },
  { id: "8", slug: "woven-sun-hat", name: "Woven Sun Hat", price: 95, originalPrice: 150, images: [], image: null, icon: "👒", category: "accessories", badge: "sale", description: "Hand-woven sun hat with a wide brim. Perfect for summer days.", sizes: ["One Size"], colors: ["Natural", "Black"] },
];

function mapApiProduct(p: Record<string, unknown>): DetailProduct {
  const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
  return {
    id: String(p._id ?? p.id ?? ""),
    slug: String(p.slug ?? ""),
    name: String(p.name ?? ""),
    price: Number(p.price ?? 0),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    images: imgs,
    image: imgs[0] ?? (p.image ? String(p.image) : null),
    icon: p.icon ? String(p.icon) : "🛍️",
    category: String(p.category ?? ""),
    badge: (p.badge as ProductBadge) ?? null,
    description: String(p.description ?? ""),
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
    colors: Array.isArray(p.colors) ? (p.colors as string[]) : ["Default"],
    stockCount: typeof p.stockCount === "number" ? p.stockCount : undefined,
    inStock: typeof p.inStock === "boolean" ? p.inStock : true,
  };
}

export default function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<DetailProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DetailProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [stickyVisible, setStickyVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  // Fetch product from MongoDB
  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    fetch(`/api/products/slug/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Record<string, unknown>) => {
        const p = mapApiProduct(data);
        setProduct(p);
        setSelectedColor(p.colors[0] ?? "");
      })
      .catch(() => {
        // Fall back to sample data
        // Only the built-in demo items fall back to sample data; anything else is "not found"
        const sample = SAMPLE_PRODUCTS.find((p) => p.slug === slug);
        if (!sample) { setProduct(null); return; }
        setProduct(sample);
        setSelectedColor(sample.colors[0]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch related products (same category)
  useEffect(() => {
    if (!product) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        const mapped = (data as Record<string, unknown>[])
          .map(mapApiProduct)
          .filter((p) => p.id !== product.id && p.category === product.category)
          .slice(0, 3);
        if (mapped.length > 0) {
          setRelatedProducts(mapped);
        } else {
          setRelatedProducts(SAMPLE_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3));
        }
      })
      .catch(() => {
        setRelatedProducts(SAMPLE_PRODUCTS.filter((p) => p.id !== product?.id).slice(0, 3));
      });
  }, [product]);

  const { recentItems, addItem } = useRecentlyViewed(product?.id ?? "");

  useEffect(() => {
    if (!product) return;
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      icon: product.icon,
      category: product.category,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && product.sizes[0] !== "One Size" && !selectedSize) {
      showToast("Please select a size");
      return;
    }
    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      image: product.image ?? product.icon,
      category: product.category,
      size: selectedSize || "One Size",
      color: selectedColor,
      qty,
    });
    showToast(`${product.name} added to cart`);
    openCart();
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes.length > 0 && product.sizes[0] !== "One Size" && !selectedSize) {
      showToast("Please select a size");
      return;
    }
    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      image: product.image ?? product.icon,
      category: product.category,
      size: selectedSize || "One Size",
      color: selectedColor,
      qty,
    });
    router.push("/checkout");
  };

  const inWishlist = product ? isInWishlist(product.id) : false;

  if (loading) {
    return (
      <div style={{ background: "#fafaf8", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: isDesktop ? "60px 48px" : "32px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "80px" : "32px" }}>
            <div style={{ aspectRatio: "3/4", background: "#f0ede7", borderRadius: 4 }} className="skeleton" />
            <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ height: 20, width: "40%", background: "#f0ede7", borderRadius: 4 }} className="skeleton" />
              <div style={{ height: 48, width: "70%", background: "#f0ede7", borderRadius: 4 }} className="skeleton" />
              <div style={{ height: 32, width: "30%", background: "#f0ede7", borderRadius: 4 }} className="skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <ProductNotFound />;

  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);
  const displayImages = rawImages.length > 0 ? rawImages.map((img) => getImageUrl(img)) : null;
  const isOutOfStock = product.inStock === false || (product.stockCount !== undefined && product.stockCount <= 0);


  return (
    <div style={{ background: "#fafaf8", minHeight: "100vh" }}>

      {/* Main Product */}
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: isDesktop ? "60px 48px" : "24px 20px" }}>
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category, href: `/shop?tab=${product.category}` },
          { label: product.name },
        ]} />

        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "80px" : "32px", alignItems: "start" }}>

          {/* Left: Images */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={isDesktop ? { position: "sticky", top: "96px" } : undefined}
          >
            {/* Main image */}
            <div style={{ aspectRatio: "3/4", background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
              {displayImages ? (
                <Image
                  src={displayImages[activeImage]}
                  alt={product.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <span style={{ fontSize: "120px" }}>{product.icon}</span>
              )}
              {isOutOfStock && (
                <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.7)", color: "#fafaf8", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 12px" }}>
                  Out of Stock
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {displayImages && displayImages.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {displayImages.map((src, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ width: 64, height: 80, border: activeImage === i ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.15)", background: "none", padding: 0, cursor: "pointer", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <Image src={src} alt={`${product.name} view ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ paddingTop: isDesktop ? "24px" : "8px" }}
          >
            {product.badge && (
              <div style={{ display: "inline-block", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", color: "white", background: product.badge === "sale" ? "#c0392b" : "#0a0a0a", marginBottom: "16px" }}>
                {product.badge}
              </div>
            )}

            <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "12px" }}>
              {product.category}
            </div>

            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px,4vw,56px)", fontWeight: 300, color: "#0a0a0a", marginBottom: "16px", lineHeight: 1.1 }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              {product.originalPrice && (
                <span style={{ fontSize: "16px", color: "#8a8680", textDecoration: "line-through" }}>৳{product.originalPrice}</span>
              )}
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: "#0a0a0a" }}>৳{product.price}</span>
              {product.originalPrice && (
                <span style={{ fontSize: "12px", color: "#c0392b", padding: "3px 8px", border: "0.5px solid #c0392b" }}>
                  Save ৳{product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 5 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fffbeb", border: "0.5px solid rgba(245,158,11,0.3)", marginBottom: 20, fontSize: "11px", color: "#92400e", letterSpacing: "0.06em" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                Only {product.stockCount} left in stock
              </div>
            )}

            {/* Color */}
            {product.colors.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: "12px" }}>
                  Color: <span style={{ color: "#0a0a0a", fontWeight: 500 }}>{selectedColor}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.colors.map((color) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      style={{ padding: "8px 16px", fontSize: "12px", border: selectedColor === color ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", color: "#0a0a0a", fontWeight: selectedColor === color ? 500 : 400, transition: "border 0.2s" }}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680" }}>Size</div>
                  <button
                    style={{ fontSize: "11px", color: "#8a8680", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.06em" }}
                    onClick={() => alert("XS: 0–2 | S: 4–6 | M: 8–10 | L: 12–14 | XL: 16–18")}
                  >
                    Size Guide
                  </button>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.sizes.map((size) => (
                    <button key={size} onClick={() => !isOutOfStock && setSelectedSize(size)}
                      style={{ minWidth: "48px", height: "52px", padding: "0 14px", fontSize: "12px", border: selectedSize === size ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)", background: selectedSize === size ? "#0a0a0a" : "none", color: selectedSize === size ? "#fafaf8" : isOutOfStock ? "#ccc" : "#0a0a0a", cursor: isOutOfStock ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: isOutOfStock ? 0.5 : 1 }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", border: "0.5px solid rgba(0,0,0,0.2)" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "44px", height: "52px", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>−</button>
                <span style={{ width: "44px", textAlign: "center", fontSize: "14px" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: "44px", height: "52px", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>+</button>
              </div>
              <button onClick={handleAddToCart} disabled={isOutOfStock}
                style={{ flex: 1, background: isOutOfStock ? "#ccc" : "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: isOutOfStock ? "not-allowed" : "pointer", height: "52px", transition: "opacity 0.2s" }}>
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button onClick={() => product && toggleWishlist({ id: product.id, name: product.name, price: product.price, category: product.category, slug: product.slug, icon: product.icon })}
                style={{ width: "52px", height: "52px", background: "none", border: "0.5px solid rgba(0,0,0,0.2)", cursor: "pointer", fontSize: "20px", color: inWishlist ? "#c0392b" : "#8a8680", transition: "color 0.2s" }}>
                {inWishlist ? "♥" : "♡"}
              </button>
            </div>

            {!isOutOfStock && (
              <button onClick={handleBuyNow}
                style={{ width: "100%", background: "#c9a96e", color: "#0a0a0a", border: "none", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", height: "52px", marginBottom: "32px" }}>
                Buy Now
              </button>
            )}

            {/* Description */}
            <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: "32px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: "12px" }}>Description</div>
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#3a3835" }}>{product.description}</p>
            </div>

            <div style={{ marginTop: "24px", padding: "16px", background: "#f5f2ec", fontSize: "12px", color: "#8a8680", lineHeight: 1.8 }}>
              🚚 Free shipping on orders over ৳150<br />
              ↩ 30-day returns, no questions asked<br />
              🔒 Secure checkout
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ background: "#f5f2ec", padding: isDesktop ? "64px 48px" : "40px 20px" }}>
          <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "12px" }}>You may also like</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px,3vw,48px)", fontWeight: 300, marginBottom: isDesktop ? "40px" : "24px" }}>Related <em>Pieces</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(3,1fr)" : "repeat(2,1fr)", gap: isDesktop ? "16px" : "12px" }}>
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ y: -4 }} style={{ background: "white", cursor: "pointer" }}>
                    <div style={{ aspectRatio: "3/4", background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                      {p.images.length > 0 ? (
                        <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "cover" }} sizes="33vw" />
                      ) : (
                        <span style={{ fontSize: "64px" }}>{p.icon}</span>
                      )}
                    </div>
                    <div style={{ padding: "20px" }}>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", color: "#0a0a0a", marginBottom: "6px" }}>{p.name}</div>
                      <div style={{ fontSize: "13px", color: "#0a0a0a" }}>৳{p.price}</div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentItems.length > 0 && (
        <div style={{ background: "#fafaf8", padding: isDesktop ? "64px 48px" : "40px 20px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
          <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#8a8680", marginBottom: "12px" }}>Your history</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(24px,3vw,40px)", fontWeight: 300, marginBottom: isDesktop ? "32px" : "20px" }}>Recently <em>Viewed</em></h2>
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? `repeat(${Math.min(recentItems.length, 4)}, 1fr)` : "repeat(2, 1fr)", gap: isDesktop ? "16px" : "12px" }}>
              {recentItems.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/product/${item.slug}`} style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ y: -4 }} style={{ background: "white", cursor: "pointer" }}>
                    <div style={{ aspectRatio: "3/4", background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "56px" }}>
                      {item.icon}
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "16px", color: "#0a0a0a", marginBottom: "4px" }}>{item.name}</div>
                      <div style={{ fontSize: "13px", color: "#0a0a0a" }}>৳{item.price}</div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Add-to-Cart Bar */}
      <motion.div
        initial={false}
        animate={{ y: stickyVisible ? 0 : 80, opacity: stickyVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(250,250,248,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          zIndex: 150,
          padding: "16px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          pointerEvents: stickyVisible ? "auto" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {product.image ? (
            <div style={{ width: 40, height: 48, position: "relative", flexShrink: 0 }}>
              <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} sizes="40px" />
            </div>
          ) : (
            <div style={{ fontSize: "32px" }}>{product.icon}</div>
          )}
          <div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", color: "#0a0a0a" }}>{product.name}</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", color: "#c9a96e" }}>৳{product.price}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#8a8680" }}>
            {selectedSize ? `Size: ${selectedSize}` : "Select a size above"}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{ background: isOutOfStock ? "#ccc" : "#0a0a0a", color: "#fafaf8", border: "none", padding: "14px 40px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: isOutOfStock ? "not-allowed" : "pointer" }}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: stickyVisible ? "88px" : "32px", left: "50%", transform: "translateX(-50%)", background: "#0a0a0a", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.05em", zIndex: 200, whiteSpace: "nowrap", transition: "bottom 0.3s" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

