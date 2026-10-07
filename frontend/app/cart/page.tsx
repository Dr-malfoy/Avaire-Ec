"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeItem, changeQty, cartTotal, cartCount } = useCart();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main>
      <Navbar />
      <div style={{ height: "72px", background: "#0a0a0a" }} />
      <div style={{ minHeight: "100vh", background: "#fafaf8" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isDesktop ? "80px 48px" : "40px 20px" }}>

          {/* Header */}
          <div style={{ marginBottom: isDesktop ? "48px" : "28px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "12px" }}>
              Your Selection
            </div>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px,4vw,56px)", fontWeight: 300, color: "#0a0a0a" }}>
              Shopping <em>Cart</em>
              {cartCount > 0 && (
                <span style={{ fontSize: "18px", color: "#8a8680", marginLeft: "16px" }}>
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>

          {cart.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "80px 0" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "24px" }}>🛍️</div>
              <p style={{ fontSize: "16px", color: "#8a8680", marginBottom: "32px" }}>
                Your cart is empty
              </p>
              <Link
                href="/shop"
                style={{ display: "inline-block", background: "#0a0a0a", color: "#fafaf8", padding: "16px 40px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}
              >
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 380px" : "1fr", gap: isDesktop ? "64px" : "40px", alignItems: "start" }}>

              {/* Cart Items */}
              <div>
                {cart.map((item, i) => (
                  <motion.div
                    key={`${item.id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ display: "flex", gap: isDesktop ? "24px" : "14px", padding: isDesktop ? "32px 0" : "20px 0", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}
                  >
                    {/* Image */}
                    <div style={{ width: isDesktop ? "120px" : "84px", height: isDesktop ? "150px" : "108px", background: "#f5f2ec", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDesktop ? "48px" : "32px" }}>
                      {item.image}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "6px" }}>
                          {item.category}
                        </div>
                        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: isDesktop ? "22px" : "18px", fontWeight: 400, color: "#0a0a0a", marginBottom: "8px", lineHeight: 1.2 }}>
                          {item.name}
                        </h3>
                        <div style={{ fontSize: "12px", color: "#8a8680", marginBottom: "16px" }}>
                          Size: {item.size} · Color: {item.color}
                        </div>
                      </div>

                      {/* Qty + Remove */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "0.5px solid rgba(0,0,0,0.15)" }}>
                          <button
                            onClick={() => changeQty(item.id, item.size, item.color, item.qty - 1)}
                            style={{ width: "40px", height: "40px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#0a0a0a" }}
                          >
                            −
                          </button>
                          <span style={{ width: "40px", textAlign: "center", fontSize: "14px" }}>{item.qty}</span>
                          <button
                            onClick={() => changeQty(item.id, item.size, item.color, item.qty + 1)}
                            style={{ width: "40px", height: "40px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#0a0a0a" }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", textDecoration: "underline" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: isDesktop ? "22px" : "17px", color: "#0a0a0a", whiteSpace: "nowrap" }}>
                        ৳{(item.price * item.qty).toFixed(2)}
                      </div>
                      {item.qty > 1 && (
                        <div style={{ fontSize: "12px", color: "#8a8680", marginTop: "4px" }}>
                          ৳{item.price.toFixed(2)} each
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                <div style={{ marginTop: "24px" }}>
                  <Link
                    href="/shop"
                    style={{ fontSize: "12px", color: "#8a8680", textDecoration: "underline", letterSpacing: "0.05em" }}
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ background: "#f5f2ec", padding: isDesktop ? "40px" : "28px", position: isDesktop ? "sticky" : "static", top: "96px" }}
              >
                <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "24px" }}>
                  Order Summary
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#3a3835" }}>
                  <span>Subtotal</span>
                  <span>৳{cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "14px", color: "#3a3835" }}>
                  <span>Shipping</span>
                  <span style={{ color: "#c9a96e" }}>{cartTotal >= 150 ? "Free" : "৳12.00"}</span>
                </div>

                <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.1)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <span style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#8a8680" }}>Total</span>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "32px", color: "#0a0a0a" }}>
                    ৳{(cartTotal + (cartTotal >= 150 ? 0 : 12)).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  style={{ width: "100%", background: "#0a0a0a", color: "#fafaf8", border: "none", padding: "18px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", marginBottom: "12px" }}
                >
                  Proceed to Checkout
                </button>

                <div style={{ textAlign: "center", fontSize: "11px", color: "#8a8680" }}>
                  🔒 Secure checkout · Free shipping over ৳150
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

