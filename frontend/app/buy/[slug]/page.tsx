"use client";
import { useState, useEffect, type ChangeEvent, type SyntheticEvent, use } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAbandonedSave } from "@/lib/useAbandonedSave";
import ProductNotFound from "@/components/ProductNotFound";
import { getImageUrl } from "@/lib/api";



// ─── Types ───────────────────────────────────────────────────────────────────

interface BuyProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  icon: string;
  category: string;
  badge: string | null;
  description: string;
  sizes: string[];
  colors: string[];
  stockCount?: number;
  inStock?: boolean;
}

// ─── Inner form ───────────────────────────────────────

function BuyForm({ product }: { product: BuyProduct }) {
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(true);
  const { save: saveAbandoned } = useAbandonedSave();

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [deliveryZone, setDeliveryZone] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");

  const shipping = deliveryZone === "inside_dhaka" ? 80 : 150;
  const subtotal = product.price * qty;
  const total = subtotal + shipping;
  const isOutOfStock = product.inStock === false ||
    (product.stockCount !== undefined && product.stockCount <= 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    saveAbandoned({
      email: updated.email,
      name: updated.name.trim(),
      phone: updated.phone.trim(),
      address: updated.address.trim(),
      items: [{
        id: product.id,
        name: product.name,
        price: product.price,
        qty,
        size: selectedSize || "One Size",
        color: selectedColor,
        image: product.images[0] ?? product.icon,
        category: product.category,
      }],
      total,
      source: "buy-now",
    });
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const phone = form.phone.replace(/[\s-]/g, "");
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone)) {
      setError("Please enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX).");
      setLoading(false);
      return;
    }

    if (!form.address.trim() || form.address.trim().length < 3) {
      setError("Please enter your full delivery address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            phone,
            email: form.email.trim(),
            address: form.address.trim(),
            deliveryZone: deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
            deliveryCharge: shipping,
          },
          shippingZone: deliveryZone,
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? product.icon,
            category: product.category,
            size: selectedSize || "One Size",
            color: selectedColor,
            qty,
          }],
          total,
          status: "pending",
          paymentMethod: "Cash on Delivery",
        }),
      });
      const data = await res.json() as { orderNumber?: string; message?: string };
      if (!res.ok) { setError(data.message ?? "Failed to place order"); return; }
      try {
        localStorage.setItem("aviar_last_order", JSON.stringify({ orderNumber: data.orderNumber, email: form.email.trim(), phone }));
      } catch {}
      router.push(`/order/confirmation?order=${encodeURIComponent(data.orderNumber ?? "")}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "#fafaf8",
    fontSize: "13px",
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#8a8680",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 100px" }}>

      {/* Back link */}
      <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a8680", textDecoration: "none", marginBottom: 32 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Shop
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "minmax(0,1fr) minmax(0,420px)" : "1fr", gap: isDesktop ? "48px" : "32px", alignItems: "start" }}>

        {/* ── LEFT: Product ─────────────────────────── */}
        <div>
          {/* Page label */}
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 8 }}>Instant Checkout</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px,3vw,42px)", fontWeight: 300, color: "#0a0a0a", marginBottom: 32, lineHeight: 1.1 }}>
            {product.name}
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 24, alignItems: "start" }}>

            {/* Image column */}
            <div>
              {/* Main image */}
              <div style={{ aspectRatio: "3/4", background: "#f5f2ec", position: "relative", overflow: "hidden", marginBottom: 10 }}>
                {product.images.length > 0 ? (
                  <Image
                    src={getImageUrl(product.images[activeImg])}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 30vw"
                    priority
                    unoptimized
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px" }}>
                    {product.icon}
                  </div>
                )}
                {product.badge && (
                  <div style={{ position: "absolute", top: 12, left: 12, background: product.badge === "sale" ? "#c0392b" : "#0a0a0a", color: "#fff", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 12px" }}>
                    {product.badge}
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.images.map((src, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{ width: 56, height: 70, border: activeImg === i ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.15)", padding: 0, cursor: "pointer", overflow: "hidden", position: "relative", background: "none", flexShrink: 0 }}>
                      <Image src={getImageUrl(src)} alt={`View ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="56px" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details column */}
            <div>
              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                {product.originalPrice && (
                  <span style={{ fontSize: "14px", color: "#8a8680", textDecoration: "line-through" }}>৳{product.originalPrice}</span>
                )}
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", color: "#0a0a0a" }}>৳{product.price}</span>
                {product.originalPrice && (
                  <span style={{ fontSize: "11px", color: "#c0392b", padding: "3px 8px", border: "0.5px solid #c0392b" }}>
                    Save ৳{product.originalPrice - product.price}
                  </span>
                )}
              </div>

              {/* Stock warning */}
              {product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 5 && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fffbeb", border: "0.5px solid rgba(245,158,11,0.3)", marginBottom: 20, fontSize: "11px", color: "#92400e" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block", flexShrink: 0 }} />
                  Only {product.stockCount} left
                </div>
              )}

              {/* Color */}
              {product.colors.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>
                    Color: <span style={{ color: "#0a0a0a", fontWeight: 500 }}>{selectedColor}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.colors.map((c) => (
                      <button key={c} onClick={() => setSelectedColor(c)}
                        style={{ padding: "7px 14px", fontSize: "12px", border: selectedColor === c ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", color: "#0a0a0a", fontWeight: selectedColor === c ? 600 : 400, transition: "border 0.15s" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {product.sizes.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>Size</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.sizes.map((s) => (
                      <button key={s} onClick={() => !isOutOfStock && setSelectedSize(s)}
                        style={{ minWidth: 46, height: 46, padding: "0 12px", fontSize: "12px", border: selectedSize === s ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)", background: selectedSize === s ? "#0a0a0a" : "none", color: selectedSize === s ? "#fafaf8" : "#0a0a0a", cursor: "pointer", transition: "all 0.15s" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>Quantity</div>
                <div style={{ display: "inline-flex", alignItems: "center", border: "0.5px solid rgba(0,0,0,0.2)" }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 40, background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#0a0a0a" }}>−</button>
                  <span style={{ width: 40, textAlign: "center", fontSize: "14px", fontFamily: "DM Sans, sans-serif" }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stockCount ?? 99, qty + 1))} style={{ width: 40, height: 40, background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#0a0a0a" }}>+</button>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 20 }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: 10 }}>About This Piece</div>
                  <p style={{ fontSize: "13px", lineHeight: 1.8, color: "#5a5a5a", margin: 0 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Perks */}
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: "🚚", text: subtotal >= 150 ? "Free shipping on your order" : `Free shipping on orders over ৳150 (add ৳${(150 - subtotal).toFixed(0)} more)` },
                  { icon: "↩", text: "30-day hassle-free returns" },
                  { icon: "🔒", text: "Secure 256-bit SSL checkout" },
                  { icon: "📦", text: "Estimated delivery in 3–5 business days" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "12px", color: "#8a8680" }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order + Checkout ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>

            {/* Order Summary */}
            <div style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680" }}>Order Summary</div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {/* Item row */}
                <div style={{ display: "flex", gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ width: 64, height: 80, background: "#f5f2ec", position: "relative", flexShrink: 0, overflow: "hidden" }}>
                    {product.images.length > 0 ? (
                      <Image src={product.images[activeImg]} alt={product.name} fill style={{ objectFit: "cover" }} sizes="64px" unoptimized />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>{product.icon}</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "16px", color: "#0a0a0a", marginBottom: 4 }}>{product.name}</div>
                    <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 4 }}>
                      {selectedColor && <span>{selectedColor}</span>}
                      {selectedColor && selectedSize && <span> · </span>}
                      {selectedSize && <span>Size {selectedSize}</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "#8a8680" }}>Qty: {qty}</div>
                  </div>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", color: "#0a0a0a", flexShrink: 0 }}>
                    ৳{(product.price * qty).toFixed(2)}
                  </div>
                </div>

                {/* Totals */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8a8680" }}>
                    <span>Subtotal</span><span>৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8a8680" }}>
                    <span>Delivery ({deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                    <span style={{ color: "#0a0a0a", fontWeight: 500 }}>৳{shipping.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
                    <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a8680" }}>Total</span>
                    <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", color: "#0a0a0a" }}>৳{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info & Address */}
            <div style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680" }}>Your Details & Address</div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input name="name" autoComplete="name" value={form.name} onChange={handleChange} required placeholder="Your full name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={handleChange} required placeholder="01XXXXXXXXX" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address (Optional)</label>
                  <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com (optional)" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Delivery Address *</label>
                  <textarea
                    name="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="House/Road no, Area, Thana/City"
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", minHeight: "75px" }}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Charge / Area Selection */}
            <div style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680" }}>Delivery Area</div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  border: deliveryZone === "inside_dhaka" ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.15)",
                  background: deliveryZone === "inside_dhaka" ? "#f5f2ec" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="radio"
                      name="deliveryZone"
                      value="inside_dhaka"
                      checked={deliveryZone === "inside_dhaka"}
                      onChange={() => setDeliveryZone("inside_dhaka")}
                      style={{ accentColor: "#0a0a0a", width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>Inside Dhaka</div>
                      <div style={{ fontSize: "11px", color: "#8a8680" }}>Delivery in 2-3 Days</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>৳80.00</div>
                </label>

                <label style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  border: deliveryZone === "outside_dhaka" ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.15)",
                  background: deliveryZone === "outside_dhaka" ? "#f5f2ec" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="radio"
                      name="deliveryZone"
                      value="outside_dhaka"
                      checked={deliveryZone === "outside_dhaka"}
                      onChange={() => setDeliveryZone("outside_dhaka")}
                      style={{ accentColor: "#0a0a0a", width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>Outside Dhaka</div>
                      <div style={{ fontSize: "11px", color: "#8a8680" }}>Courier Delivery 3-5 Days</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>৳150.00</div>
                </label>
              </div>
            </div>

            {/* Payment */}
            <div style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <div style={{ padding: "20px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680" }}>Payment Method</div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ padding: "16px", background: "#f5f2ec", border: "0.5px solid rgba(201,169,110,0.3)", fontSize: "13px", color: "#3a3835", lineHeight: 1.8 }}>
                  <strong>🚚 Cash on Delivery</strong><br />
                  Pay in cash when your order arrives at your door.
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "12px 16px", background: "#fff0f0", border: "0.5px solid #c0392b", color: "#c0392b", fontSize: "13px", marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={loading || isOutOfStock}
              style={{
                width: "100%",
                background: isOutOfStock ? "#ccc" : loading ? "rgba(201,169,110,0.7)" : "linear-gradient(90deg, #c9a96e 0%, #b8924a 100%)",
                color: "#0a0a0a",
                border: "none",
                padding: "18px",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: isOutOfStock || loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: isOutOfStock ? "none" : "0 8px 24px rgba(201,169,110,0.4)",
              }}
            >
              {loading ? "Processing…" : isOutOfStock ? "Out of Stock" : `Place Order — ৳${total.toFixed(2)}`}
            </button>
            <p style={{ textAlign: "center", fontSize: "11px", color: "#8a8680", marginTop: 12 }}>
              🔒 Secure checkout · 30-day returns
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function BuySkeleton() {
  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 48 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ aspectRatio: "3/4", background: "#f0ede7", borderRadius: 4 }} className="skeleton" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: i === 0 ? 40 : 24, background: "#f0ede7", borderRadius: 4, width: i === 0 ? "60%" : "80%" }} className="skeleton" />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 80, background: "#f0ede7", borderRadius: 4 }} className="skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sample fallback (shown when product not yet in MongoDB) ─────────────────

const SAMPLE_FALLBACK: BuyProduct[] = [
  { id: "1", slug: "cashmere-wrap", name: "Cashmere Wrap", price: 245, originalPrice: null, images: [], icon: "🧥", category: "Clothing", badge: "new", description: "Luxuriously soft cashmere wrap, perfect for any occasion. Hand-finished edges and a relaxed drape make this an essential layering piece.", sizes: ["XS","S","M","L","XL"], colors: ["Ivory","Camel","Black"], inStock: true },
  { id: "2", slug: "leather-tote", name: "Leather Tote", price: 385, originalPrice: null, images: [], icon: "👜", category: "Accessories", badge: null, description: "Full-grain leather tote with a structured silhouette. Spacious interior with suede lining and gold-tone hardware.", sizes: ["One Size"], colors: ["Tan","Black","Burgundy"], inStock: true },
  { id: "3", slug: "linen-blazer", name: "Linen Blazer", price: 310, originalPrice: 420, images: [], icon: "👔", category: "Clothing", badge: "sale", description: "Tailored linen blazer with a relaxed fit. Breathable fabric perfect for warm weather dressing.", sizes: ["XS","S","M","L","XL"], colors: ["Sand","White","Navy"], inStock: true },
  { id: "4", slug: "silk-wrap-blouse", name: "Silk Wrap Blouse", price: 295, originalPrice: null, images: [], icon: "👚", category: "Clothing", badge: "new", description: "Elegant silk wrap blouse with a flattering silhouette. Perfect for both formal and casual occasions.", sizes: ["XS","S","M","L","XL"], colors: ["White","Blush","Black"], inStock: true },
  { id: "5", slug: "cashmere-turtleneck", name: "Cashmere Turtleneck", price: 450, originalPrice: null, images: [], icon: "🧥", category: "Clothing", badge: null, description: "Premium cashmere turtleneck with a refined fit. Exceptionally soft and warm for cooler seasons.", sizes: ["XS","S","M","L","XL"], colors: ["Ivory","Grey","Navy"], inStock: true },
  { id: "6", slug: "leather-crossbody", name: "Leather Crossbody", price: 320, originalPrice: 400, images: [], icon: "👜", category: "Accessories", badge: "sale", description: "Compact leather crossbody bag with adjustable strap and gold hardware.", sizes: ["One Size"], colors: ["Tan","Black"], inStock: true },
  { id: "7", slug: "tailored-trousers", name: "Tailored Trousers", price: 250, originalPrice: null, images: [], icon: "👖", category: "Clothing", badge: null, description: "Perfectly tailored trousers with a straight leg cut. Versatile and sophisticated.", sizes: ["XS","S","M","L","XL"], colors: ["Black","Camel","Navy"], inStock: true },
  { id: "8", slug: "woven-sun-hat", name: "Woven Sun Hat", price: 95, originalPrice: 150, images: [], icon: "👒", category: "Accessories", badge: "sale", description: "Hand-woven sun hat with a wide brim. Perfect for summer days.", sizes: ["One Size"], colors: ["Natural","Black"], inStock: true },
  { id: "9", slug: "silk-wrap-blouse", name: "Silk Wrap Blouse", price: 295, originalPrice: null, images: [], icon: "👚", category: "Clothing", badge: "new", description: "Elegant silk wrap blouse.", sizes: ["XS","S","M","L","XL"], colors: ["White","Blush","Black"], inStock: true },
  { id: "10", slug: "gold-plated-cuff", name: "Gold Plated Cuff", price: 180, originalPrice: null, images: [], icon: "✨", category: "Accessories", badge: null, description: "Handcrafted gold-plated cuff bracelet with a polished finish.", sizes: ["One Size"], colors: ["Gold"], inStock: true },
  { id: "11", slug: "ceramic-vase", name: "Ceramic Vase", price: 120, originalPrice: null, images: [], icon: "🏺", category: "Home", badge: "new", description: "Hand-thrown ceramic vase with a matte glaze finish.", sizes: ["One Size"], colors: ["White","Sage","Terracotta"], inStock: true },
  { id: "12", slug: "linen-lounge-set", name: "Linen Lounge Set", price: 210, originalPrice: null, images: [], icon: "👘", category: "Clothing", badge: null, description: "Relaxed linen lounge set, perfect for effortless style at home or out.", sizes: ["XS","S","M","L","XL"], colors: ["Sand","White","Dusty Rose"], inStock: true },
];

function mapApiToProduct(data: Record<string, unknown>): BuyProduct {
  const imgs = Array.isArray(data.images) ? (data.images as string[]) : [];
  return {
    id: String(data._id ?? data.id ?? ""),
    slug: String(data.slug ?? ""),
    name: String(data.name ?? ""),
    price: Number(data.price ?? 0),
    originalPrice: data.originalPrice != null ? Number(data.originalPrice) : null,
    images: imgs,
    icon: data.icon ? String(data.icon) : "🛍️",
    category: String(data.category ?? ""),
    badge: data.badge ? String(data.badge) : null,
    description: String(data.description ?? ""),
    sizes: Array.isArray(data.sizes) ? (data.sizes as string[]) : [],
    colors: Array.isArray(data.colors) ? (data.colors as string[]) : ["Default"],
    stockCount: typeof data.stockCount === "number" ? data.stockCount : undefined,
    inStock: typeof data.inStock === "boolean" ? data.inStock : true,
  };
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

function BuyPageInner({ slug }: { slug: string }) {
  const [product, setProduct] = useState<BuyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/slug/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Record<string, unknown>) => {
        setProduct(mapApiToProduct(data));
      })
      .catch(() => {
        // Fall back to sample products (shown when DB is empty or product not yet added)
        const sample = SAMPLE_FALLBACK.find((p) => p.slug === slug);
        if (sample) setProduct(sample);
        else {
          setProduct(null); // unknown product -> "not found" instead of a random demo item
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <BuySkeleton />;
  if (!product) return <ProductNotFound />;

  return (
    <BuyForm product={product} />
  );
}

export default function BuyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <main>
      <Navbar />
      {/* Dark spacer forces navbar into its light/scrolled state with visible logo */}
      <div style={{ height: "72px", background: "#0a0a0a" }} />
      <div style={{ background: "#fafaf8" }}>
        <BuyPageInner slug={slug} />
      </div>
      <Footer />
    </main>
  );
}
