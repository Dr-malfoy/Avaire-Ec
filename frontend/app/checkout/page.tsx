"use client";
import { useState, useEffect, type ChangeEvent, type SyntheticEvent } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useAbandonedSave } from "@/lib/useAbandonedSave";

// Only Cash on Delivery is offered.

function CheckoutForm() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [deliveryZone, setDeliveryZone] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
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

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; type: string; value: number} | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const deliveryFee = deliveryZone === "inside_dhaka" ? 80 : 150;

  const discount = (() => {
    if (!appliedCoupon) return 0;
    const c = appliedCoupon;
    if (c.type === "percent") return Math.round((cartTotal * c.value) / 100 * 100) / 100;
    if (c.type === "fixed") return Math.min(c.value, cartTotal);
    if (c.type === "shipping") return deliveryFee;
    return 0;
  })();

  const effectiveShipping = appliedCoupon && appliedCoupon.type === "shipping" ? 0 : deliveryFee;
  const total = Math.max(0, cartTotal - (appliedCoupon && appliedCoupon.type !== "shipping" ? discount : 0) + effectiveShipping);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    // Save abandoned checkout whenever email is valid
    saveAbandoned({
      email: updated.email,
      name: updated.name.trim(),
      phone: updated.phone.trim(),
      address: updated.address.trim(),
      items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color, image: i.image, category: i.category })),
      total,
      source: "checkout",
    });
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    setCouponError("");
    if (!code) return;
    
    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAppliedCoupon({
          code: data.code,
          type: data.discountType,
          value: Number(data.discountValue)
        });
        setCouponInput("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to verify coupon");
    } finally {
      setApplyingCoupon(false);
    }
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
            deliveryCharge: effectiveShipping,
          },
          shippingZone: deliveryZone,
          items: cart,
          total,
          couponCode: appliedCoupon?.code,
          paymentMethod: "Cash on Delivery",
          status: "pending",
        }),
      });
      const data = await res.json() as { orderNumber?: string; message?: string };
      if (!res.ok) { setError(data.message ?? "Failed to place order. Please try again."); return; }
      try {
        localStorage.setItem("aviar_last_order", JSON.stringify({ orderNumber: data.orderNumber, email: form.email.trim() }));
      } catch {}
      clearCart();
      router.push(`/order/confirmation?order=${encodeURIComponent(data.orderNumber ?? "")}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "14px 16px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isDesktop ? "48px 48px 80px" : "32px 20px 60px", display: "grid", gridTemplateColumns: isDesktop ? "1fr 380px" : "1fr", gap: isDesktop ? "64px" : "40px", alignItems: "start" }}>

      {/* Left: Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "12px" }}>Secure Checkout</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, marginBottom: isDesktop ? "48px" : "28px" }}>
          Complete Your <em>Order</em>
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Contact & Delivery Details */}
          <div style={{ marginBottom: isDesktop ? "40px" : "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "20px" }}>Your Details & Address</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input name="name" placeholder="Full Name" autoComplete="name" value={form.name} onChange={handleChange} required style={inputStyle} />
              <input name="phone" type="tel" inputMode="tel" placeholder="Phone Number (01XXXXXXXXX)" autoComplete="tel" value={form.phone} onChange={handleChange} required style={inputStyle} />
              <input name="email" type="email" placeholder="Email Address" autoComplete="email" value={form.email} onChange={handleChange} required style={inputStyle} />
              <textarea
                name="address"
                placeholder="Delivery Address (House/Road, Area, Thana/City)"
                autoComplete="street-address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
                style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
              />
            </div>
          </div>

          {/* Delivery Zone Radio Buttons */}
          <div style={{ marginBottom: isDesktop ? "40px" : "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "16px" }}>Delivery Charge</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Inside Dhaka */}
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                border: deliveryZone === "inside_dhaka" ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.15)",
                background: deliveryZone === "inside_dhaka" ? "#f5f2ec" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                    <div style={{ fontSize: "11px", color: "#8a8680" }}>Standard Home Delivery (2-3 Days)</div>
                  </div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: "DM Sans, sans-serif" }}>৳80.00</div>
              </label>

              {/* Outside Dhaka */}
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                border: deliveryZone === "outside_dhaka" ? "1.5px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.15)",
                background: deliveryZone === "outside_dhaka" ? "#f5f2ec" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                    <div style={{ fontSize: "11px", color: "#8a8680" }}>Courier Delivery (3-5 Days)</div>
                  </div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: "DM Sans, sans-serif" }}>৳150.00</div>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: isDesktop ? "40px" : "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "20px" }}>Payment Method</div>
            <div style={{ padding: "20px", background: "#f5f2ec", border: "0.5px solid rgba(201,169,110,0.3)" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>🚚 Cash on Delivery</div>
              <div style={{ fontSize: "13px", color: "#3a3835", lineHeight: 1.8 }}>
                Pay in cash when your order is delivered to your address.
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fff0f0", border: "0.5px solid #c0392b", color: "#c0392b", fontSize: "13px", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || cart.length === 0}
            style={{ width: "100%", background: "#dc2626", color: "#fafaf8", border: "none", padding: "18px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s", fontWeight: 600 }}>
            {loading ? "Processing..." : `Place Order — ৳${total.toFixed(2)}`}
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#8a8680", marginTop: "16px" }}>🔒 Your details are kept private</p>
        </form>
      </motion.div>

      {/* Right: Order Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        style={{ background: "#f5f2ec", padding: "40px", position: "sticky", top: "96px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "24px" }}>Order Summary</div>

        {cart.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#8a8680" }}>Your cart is empty</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", paddingBottom: "16px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontFamily: "Cormorant Garamond, serif" }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: "#8a8680", marginTop: "2px" }}>{item.size} · {item.color} · Qty {item.qty}</div>
                </div>
                <div style={{ fontSize: "14px", marginLeft: "16px", flexShrink: 0 }}>৳{(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}

            {/* Coupon Code */}
            <div style={{ marginTop: "8px", marginBottom: "16px" }}>
              {appliedCoupon ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(201,169,110,0.12)", border: "0.5px solid rgba(201,169,110,0.4)" }}>
                  <div>
                    <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c9a96e" }}>
                      ✓ {appliedCoupon.code}
                    </span>
                    <span style={{ fontSize: "11px", color: "#8a8680", marginLeft: "8px" }}>
                      — {appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% off` : appliedCoupon.type === 'fixed' ? `৳${appliedCoupon.value} off` : 'Free shipping'}
                    </span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#8a8680" }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: "0" }}>
                    <input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                      style={{ flex: 1, padding: "10px 14px", border: "0.5px solid rgba(0,0,0,0.15)", borderRight: "none", background: "white", fontSize: "12px", outline: "none", fontFamily: "DM Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                      style={{ padding: "10px 16px", background: "#0a0a0a", color: "#fafaf8", border: "none", cursor: applyingCoupon ? "not-allowed" : "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif", opacity: applyingCoupon ? 0.7 : 1 }}
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p style={{ fontSize: "11px", color: "#c0392b", marginTop: "6px" }}>{couponError}</p>
                  )}
                  <p style={{ fontSize: "10px", color: "#8a8680", marginTop: "6px", letterSpacing: "0.04em" }}>
                    Have a coupon code? Enter it above.
                  </p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8a8680", marginBottom: "8px" }}>
                <span>Subtotal</span>
                <span>৳{cartTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#c9a96e", marginBottom: "8px" }}>
                  <span>Discount</span>
                  <span>−৳{discount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#8a8680", marginBottom: "16px" }}>
                <span>Delivery ({deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                <span style={{ color: effectiveShipping === 0 ? "#c9a96e" : "#0a0a0a", fontWeight: 500 }}>
                  {effectiveShipping === 0 ? "Free" : `৳${effectiveShipping.toFixed(2)}`}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "0.5px solid rgba(0,0,0,0.1)" }}>
                <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a8680" }}>Total</span>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px" }}>৳{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <div style={{ height: "72px", background: "#0a0a0a" }} />
      <div style={{ minHeight: "100vh", background: "#fafaf8" }}>
        <CheckoutForm />
      </div>
      <Footer />
    </main>
  );
}
