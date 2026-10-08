"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Breadcrumb from "@/components/Breadcrumb";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface SavedOrderInfo {
  orderNumber: string;
  email?: string;
  phone?: string;
}

interface TrackedOrder {
  orderNumber: string;
  status: "pending" | "paid" | "Processing" | "Shipped" | "Delivered";
  total: number;
  items: { name?: string; qty?: number; image?: string }[];
  createdAt: string;
}

const STATUS_LABEL: Record<TrackedOrder["status"], string> = {
  pending: "Order Placed",
  paid: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
};

const STATUS_COLORS: Record<TrackedOrder["status"], { bg: string; fg: string }> = {
  pending:    { bg: "#fef3c7", fg: "#92400e" },
  paid:       { bg: "#dbeafe", fg: "#1e40af" },
  Processing: { bg: "#fef3c7", fg: "#b45309" },
  Shipped:    { bg: "#dbeafe", fg: "#1e40af" },
  Delivered:  { bg: "#d1fae5", fg: "#065f46" },
};

export default function DashboardPage() {
  const { cart, cartTotal, cartCount } = useCart();
  const { wishlist, wishlistCount } = useWishlist();
  const [isDesktop, setIsDesktop] = useState(true);
  const [savedOrder, setSavedOrder] = useState<SavedOrderInfo | null>(null);
  const [latestOrder, setLatestOrder] = useState<TrackedOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Read saved order from localStorage and fetch its current status
  useEffect(() => {
    let info: SavedOrderInfo | null = null;
    try {
      const raw = localStorage.getItem("aviar_last_order");
      if (raw) info = JSON.parse(raw);
    } catch {}

    if (!info?.orderNumber) return;
    setSavedOrder(info);
    setOrderLoading(true);

    const contactParam = info.email
      ? `email=${encodeURIComponent(info.email)}`
      : info.phone
      ? `phone=${encodeURIComponent(info.phone)}`
      : "";
    fetch(`/api/orders/track?orderNumber=${encodeURIComponent(info.orderNumber)}${contactParam ? `&${contactParam}` : ""}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.order) setLatestOrder(data.order); })
      .catch(() => {})
      .finally(() => setOrderLoading(false));
  }, []);

  const sectionPad = isDesktop ? "60px 48px 80px" : "32px 20px 60px";
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "0.5px solid rgba(0,0,0,0.08)",
    padding: isDesktop ? "28px" : "20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e",
  };

  const statusCfg = latestOrder ? STATUS_COLORS[latestOrder.status] : null;

  return (
    <PageTransition>
      <main>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />

        <section style={{ background: "#fafaf8", padding: sectionPad, minHeight: "70vh" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />

            <div style={{ marginBottom: isDesktop ? "40px" : "24px" }}>
              <div style={labelStyle}>Welcome</div>
              <h1 style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(32px,4vw,56px)", fontWeight: 300,
                color: "#0a0a0a", lineHeight: 1.1, marginTop: 6,
              }}>
                Your <em>Dashboard</em>
              </h1>
              <p style={{ fontSize: 14, color: "#8a8680", marginTop: 12, lineHeight: 1.6, maxWidth: 560 }}>
                Track orders, manage your cart and wishlist, and pick up where you left off.
              </p>
            </div>

            {/* Latest order — featured if available */}
            {latestOrder && statusCfg && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                style={{
                  background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)",
                  borderLeft: "3px solid #c9a96e",
                  padding: isDesktop ? "28px 32px" : "22px 20px",
                  marginBottom: 20,
                  display: "flex", flexDirection: isDesktop ? "row" : "column",
                  gap: 16, alignItems: isDesktop ? "center" : "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...labelStyle, marginBottom: 6 }}>Latest Order</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#0a0a0a", letterSpacing: "0.06em" }}>
                      {latestOrder.orderNumber}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                      padding: "3px 10px", borderRadius: 100,
                      background: statusCfg.bg, color: statusCfg.fg,
                    }}>
                      {STATUS_LABEL[latestOrder.status]}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#8a8680" }}>
                    {latestOrder.items.length} item{latestOrder.items.length !== 1 ? "s" : ""} · ৳{latestOrder.total.toFixed(2)} · Placed{" "}
                    {new Date(latestOrder.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <Link
                  href={`/track?order=${encodeURIComponent(latestOrder.orderNumber)}`}
                  style={{
                    background: "#0a0a0a", color: "#fafaf8",
                    padding: "12px 26px", fontSize: 11, letterSpacing: "0.12em",
                    textTransform: "uppercase", textDecoration: "none",
                    fontFamily: "DM Sans, sans-serif", flexShrink: 0, whiteSpace: "nowrap",
                  }}
                >
                  View Status
                </Link>
              </motion.div>
            )}

            {orderLoading && !latestOrder && (
              <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", padding: 20, marginBottom: 20, fontSize: 13, color: "#8a8680" }}>
                Loading your latest order…
              </div>
            )}

            {!orderLoading && !latestOrder && savedOrder && (
              <div style={{ background: "#fff0f0", border: "0.5px solid rgba(192,57,43,0.2)", padding: 16, marginBottom: 20, fontSize: 13, color: "#8a8680" }}>
                We saved order <strong>{savedOrder.orderNumber}</strong> but couldn&apos;t fetch its current status.{" "}
                <Link href="/track" style={{ color: "#0a0a0a", textDecoration: "underline" }}>Try again</Link>
              </div>
            )}

            {/* Quick action cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
              gap: isDesktop ? 16 : 12,
              marginBottom: 24,
            }}>
              {/* Track */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} style={cardStyle}>
                <div style={labelStyle}>Order Status</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#0a0a0a", lineHeight: 1.1 }}>
                  Track an Order
                </div>
                <p style={{ fontSize: 13, color: "#8a8680", margin: 0 }}>
                  Check the status of any order using your order number and email.
                </p>
                <Link href="/track" style={{
                  marginTop: "auto", display: "inline-block",
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#0a0a0a", textDecoration: "none",
                  borderBottom: "0.5px solid #0a0a0a", paddingBottom: 2, alignSelf: "flex-start",
                }}>
                  Open tracker →
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} style={cardStyle}>
                <div style={labelStyle}>Shopping Cart</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#0a0a0a", lineHeight: 1.1 }}>
                  {cartCount > 0 ? `${cartCount} item${cartCount !== 1 ? "s" : ""}` : "Empty cart"}
                </div>
                <p style={{ fontSize: 13, color: "#8a8680", margin: 0 }}>
                  {cartCount > 0
                    ? `Subtotal ৳${cartTotal.toFixed(2)}. Ready when you are.`
                    : "You haven't added anything yet."}
                </p>
                <Link href={cartCount > 0 ? "/cart" : "/shop"} style={{
                  marginTop: "auto", display: "inline-block",
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#0a0a0a", textDecoration: "none",
                  borderBottom: "0.5px solid #0a0a0a", paddingBottom: 2, alignSelf: "flex-start",
                }}>
                  {cartCount > 0 ? "View cart →" : "Browse shop →"}
                </Link>
              </motion.div>

              {/* Wishlist */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} style={cardStyle}>
                <div style={labelStyle}>Wishlist</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#0a0a0a", lineHeight: 1.1 }}>
                  {wishlistCount > 0 ? `${wishlistCount} saved` : "No saved items"}
                </div>
                <p style={{ fontSize: 13, color: "#8a8680", margin: 0 }}>
                  {wishlistCount > 0
                    ? "Pieces you've saved for later."
                    : "Tap the heart on any product to save it here."}
                </p>
                <Link href={wishlistCount > 0 ? "/wishlist" : "/shop"} style={{
                  marginTop: "auto", display: "inline-block",
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#0a0a0a", textDecoration: "none",
                  borderBottom: "0.5px solid #0a0a0a", paddingBottom: 2, alignSelf: "flex-start",
                }}>
                  {wishlistCount > 0 ? "View wishlist →" : "Discover →"}
                </Link>
              </motion.div>
            </div>

            {/* In-cart preview */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
                style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", marginBottom: 20 }}
              >
                <div style={{ padding: isDesktop ? "20px 28px" : "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={labelStyle}>In your cart</div>
                  <Link href="/cart" style={{ fontSize: 11, color: "#8a8680", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    View all →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {cart.slice(0, 3).map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} style={{
                      display: "flex", gap: 14, padding: isDesktop ? "16px 28px" : "14px 20px",
                      borderBottom: "0.5px solid rgba(0,0,0,0.04)", alignItems: "center",
                    }}>
                      <div style={{ width: 52, height: 52, background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {item.image}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, color: "#0a0a0a" }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "#8a8680", marginTop: 2 }}>
                          {item.size} · {item.color} · Qty {item.qty}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: "#0a0a0a", whiteSpace: "nowrap" }}>
                        ৳{(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                {cart.length > 3 && (
                  <div style={{ padding: "12px 20px", fontSize: 12, color: "#8a8680", textAlign: "center" }}>
                    + {cart.length - 3} more item{cart.length - 3 !== 1 ? "s" : ""}
                  </div>
                )}
              </motion.div>
            )}

            {/* Wishlist preview */}
            {wishlist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}
                style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", marginBottom: 20 }}
              >
                <div style={{ padding: isDesktop ? "20px 28px" : "16px 20px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={labelStyle}>Saved for later</div>
                  <Link href="/wishlist" style={{ fontSize: 11, color: "#8a8680", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    View all →
                  </Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 1, background: "rgba(0,0,0,0.04)" }}>
                  {wishlist.slice(0, isDesktop ? 4 : 4).map((item) => (
                    <Link key={item.id} href={`/product/${item.slug}`} style={{ background: "#fff", padding: 14, textDecoration: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ aspectRatio: "1/1", background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                        {item.icon}
                      </div>
                      <div style={{ fontSize: 13, color: "#0a0a0a", fontFamily: "Cormorant Garamond, serif" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#8a8680" }}>৳{item.price}</div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Help / shortcuts */}
            <div style={{
              background: "#f5f2ec", padding: isDesktop ? "28px" : "22px 20px",
              border: "0.5px solid rgba(201,169,110,0.15)",
              display: "flex", flexDirection: isDesktop ? "row" : "column",
              gap: 16, alignItems: isDesktop ? "center" : "flex-start",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#0a0a0a", marginBottom: 6 }}>
                  Need a hand?
                </div>
                <p style={{ fontSize: 13, color: "#8a8680", margin: 0, lineHeight: 1.6 }}>
                  Our team is here to help with anything — sizing, returns, or pre-purchase questions.
                </p>
              </div>
              <Link href="/contact" style={{
                background: "#0a0a0a", color: "#fafaf8",
                padding: "12px 26px", fontSize: 11, letterSpacing: "0.12em",
                textTransform: "uppercase", textDecoration: "none",
                fontFamily: "DM Sans, sans-serif", flexShrink: 0, whiteSpace: "nowrap",
              }}>
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}

