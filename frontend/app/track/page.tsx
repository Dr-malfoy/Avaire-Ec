"use client";
import { useState, useEffect, Suspense, type SyntheticEvent } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

interface TrackedItem {
  productId?: string;
  name?: string;
  price?: number;
  qty?: number;
  size?: string;
  color?: string;
  image?: string;
  category?: string;
}

interface TrackedOrder {
  orderNumber: string;
  status: "pending" | "paid" | "Processing" | "Shipped" | "Delivered";
  total: number;
  paymentMethod?: string;
  items: TrackedItem[];
  customer: { name?: string; email?: string; city?: string; country?: string };
  createdAt: string;
  updatedAt: string;
}

const STAGES = [
  { key: "pending",    label: "Order Placed",  desc: "We've received your order." },
  { key: "paid",       label: "Confirmed",     desc: "Your order has been confirmed by our team." },
  { key: "Processing", label: "Processing",    desc: "We're preparing your items." },
  { key: "Shipped",    label: "Shipped",       desc: "Your order is on its way." },
  { key: "Delivered",  label: "Delivered",     desc: "Your order has arrived." },
] as const;

function stageIndex(status: TrackedOrder["status"]): number {
  const i = STAGES.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

function StatusTimeline({ order, isDesktop }: { order: TrackedOrder; isDesktop: boolean }) {
  const current = stageIndex(order.status);

  if (isDesktop) {
    // Horizontal timeline
    return (
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, padding: "32px 0" }}>
        {STAGES.map((stage, i) => {
          const reached = i <= current;
          const isCurrent = i === current;
          return (
            <div key={stage.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", textAlign: "center" }}>
              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div style={{
                  position: "absolute", top: 16, left: "50%", width: "100%", height: 2,
                  background: i < current ? "#c9a96e" : "rgba(0,0,0,0.08)",
                  zIndex: 0,
                }} />
              )}
              {/* Dot */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: reached ? "#c9a96e" : "#fff",
                border: reached ? "2px solid #c9a96e" : "2px solid rgba(0,0,0,0.15)",
                color: reached ? "#0a0a0a" : "#8a8680",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 600, position: "relative", zIndex: 1,
                boxShadow: isCurrent ? "0 0 0 6px rgba(201,169,110,0.18)" : "none",
                transition: "all 0.3s ease",
              }}>
                {reached ? "✓" : i + 1}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600, marginTop: 12, color: reached ? "#0a0a0a" : "#8a8680",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {stage.label}
              </div>
              <div style={{ fontSize: 11, color: "#8a8680", marginTop: 4, maxWidth: 140 }}>
                {stage.desc}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical timeline for mobile
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px 0" }}>
      {STAGES.map((stage, i) => {
        const reached = i <= current;
        const isCurrent = i === current;
        const isLast = i === STAGES.length - 1;
        return (
          <div key={stage.key} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: isLast ? 0 : 20 }}>
            {/* Connector */}
            {!isLast && (
              <div style={{
                position: "absolute", left: 15, top: 32, bottom: 0, width: 2,
                background: i < current ? "#c9a96e" : "rgba(0,0,0,0.08)",
              }} />
            )}
            {/* Dot */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: reached ? "#c9a96e" : "#fff",
              border: reached ? "2px solid #c9a96e" : "2px solid rgba(0,0,0,0.15)",
              color: reached ? "#0a0a0a" : "#8a8680",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              boxShadow: isCurrent ? "0 0 0 5px rgba(201,169,110,0.18)" : "none",
              transition: "all 0.3s ease",
            }}>
              {reached ? "✓" : i + 1}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: reached ? "#0a0a0a" : "#8a8680",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {stage.label}
              </div>
              <div style={{ fontSize: 12, color: "#8a8680", marginTop: 2, lineHeight: 1.5 }}>
                {stage.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STORAGE_KEY = "aviar_last_order";

function TrackContent() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order")?.toUpperCase() ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fetchOrder = async (orderNum: string, emailAddr: string) => {
    setError("");
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNum)}&email=${encodeURIComponent(emailAddr)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Could not find your order. Please check the details and try again.");
      } else {
        setOrder(data.order);
        // Remember credentials so customer doesn't have to retype on reload
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ orderNumber: orderNum, email: emailAddr }));
        } catch {}
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // On mount: restore saved credentials and auto-fetch if we have them
  useEffect(() => {
    let saved: { orderNumber?: string; email?: string } | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    const urlOrder = params.get("order")?.toUpperCase() ?? "";
    const finalOrder = urlOrder || saved?.orderNumber || "";
    const finalEmail = saved?.email || "";

    if (finalOrder) setOrderNumber(finalOrder);
    if (finalEmail) setEmail(finalEmail);
    if (finalOrder && finalEmail) {
      fetchOrder(finalOrder, finalEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    fetchOrder(orderNumber.trim(), email.trim());
  };

  const handleClear = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setOrder(null);
    setOrderNumber("");
    setEmail("");
    setError("");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "#fff", fontSize: 14, outline: "none",
    fontFamily: "DM Sans, sans-serif", color: "#0a0a0a",
  };

  return (
    <section style={{ background: "#fafaf8", padding: isDesktop ? "60px 48px 80px" : "32px 20px 60px", minHeight: "70vh" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />

        <div style={{ marginBottom: isDesktop ? "40px" : "24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "12px" }}>
            Order Status
          </div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(32px,4vw,56px)", fontWeight: 300, color: "#0a0a0a", lineHeight: 1.1 }}>
            Track Your <em>Order</em>
          </h1>
          <p style={{ fontSize: 14, color: "#8a8680", marginTop: 12, lineHeight: 1.6, maxWidth: 520 }}>
            Enter the order number you received in your confirmation email along with the email address used at checkout.
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          style={{ background: "#fff", padding: isDesktop ? "32px" : "24px 20px", border: "0.5px solid rgba(0,0,0,0.08)", marginBottom: 24 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: 8 }}>
                Order Number
              </label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="AVXXXXXXXX"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8680", marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "#fff0f0", border: "0.5px solid rgba(192,57,43,0.3)", color: "#c0392b", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={loading || !orderNumber.trim() || !email.trim()}
              style={{
                width: isDesktop ? "auto" : "100%",
                minWidth: 200,
                background: loading ? "#666" : "#0a0a0a", color: "#fafaf8",
                border: "none", padding: "14px 32px",
                fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: !orderNumber.trim() || !email.trim() ? 0.5 : 1,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {loading ? "Searching…" : "Track Order"}
            </button>
            {order && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: "none", border: "none", color: "#8a8680",
                  fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
                  cursor: "pointer", textDecoration: "underline",
                  fontFamily: "DM Sans, sans-serif", padding: "8px 4px",
                }}
              >
                Track a different order
              </button>
            )}
          </div>
        </motion.form>

        {/* Result */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)" }}
          >
            {/* Header */}
            <div style={{ padding: isDesktop ? "28px 32px" : "20px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: isDesktop ? "row" : "column", justifyContent: "space-between", gap: 12, alignItems: isDesktop ? "center" : "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8680", marginBottom: 4 }}>Order</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, color: "#0a0a0a", letterSpacing: "0.08em" }}>
                  {order.orderNumber}
                </div>
              </div>
              <div style={{ textAlign: isDesktop ? "right" : "left" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8680", marginBottom: 4 }}>Total</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, color: "#0a0a0a" }}>
                  ৳{order.total.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ padding: isDesktop ? "12px 32px" : "12px 20px" }}>
              <StatusTimeline order={order} isDesktop={isDesktop} />
            </div>

            {/* Items */}
            <div style={{ padding: isDesktop ? "20px 32px 28px" : "16px 20px 24px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: 14 }}>
                Items ({order.items.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 56, height: 56, background: "#f5f2ec", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {item.image ?? "🛍️"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, color: "#0a0a0a" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#8a8680", marginTop: 2 }}>
                        {[item.size, item.color].filter(Boolean).join(" · ")}{item.qty ? ` · Qty ${item.qty}` : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#0a0a0a", whiteSpace: "nowrap" }}>
                      ৳{((item.price ?? 0) * (item.qty ?? 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer info */}
            <div style={{ padding: isDesktop ? "16px 32px" : "14px 20px", background: "#f5f2ec", display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "#8a8680" }}>
              <span>Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              {order.paymentMethod && <span>· {order.paymentMethod}</span>}
              {order.customer.city && <span>· Ship to {order.customer.city}{order.customer.country ? `, ${order.customer.country}` : ""}</span>}
            </div>
          </motion.div>
        )}

        {!order && !loading && !error && (
          <div style={{ marginTop: 16, padding: "16px 18px", background: "#f5f2ec", fontSize: 13, color: "#8a8680", lineHeight: 1.7 }}>
            Don&apos;t have an order number? <Link href="/contact" style={{ color: "#0a0a0a", textDecoration: "underline" }}>Contact us</Link> and we&apos;ll help you find it.
          </div>
        )}
      </div>
    </section>
  );
}

export default function TrackPage() {
  return (
    <PageTransition>
      <main>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />
        <Suspense fallback={<div style={{ minHeight: "70vh", background: "#fafaf8" }} />}>
          <TrackContent />
        </Suspense>
        <Footer />
      </main>
    </PageTransition>
  );
}
