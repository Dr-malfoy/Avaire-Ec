// components/Newsletter.tsx
"use client";

import { useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setLoading(true);
    // Simulate luxury invitation registration
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <section
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #11100e 0%, #0a0a0a 100%)",
        borderTop: "1px solid rgba(201, 169, 110, 0.2)",
        borderBottom: "1px solid rgba(201, 169, 110, 0.1)",
        overflow: "hidden",
        padding: "100px 24px"
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(600px, 90vw)",
          height: "350px",
          background: "radial-gradient(ellipse at center, rgba(201, 169, 110, 0.08) 0%, rgba(10, 10, 10, 0) 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 10, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Top Crest / Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              border: "0.5px solid rgba(201, 169, 110, 0.3)",
              background: "rgba(201, 169, 110, 0.05)",
              marginBottom: "24px"
            }}
          >
            <span style={{ color: "#c9a96e", fontSize: "10px" }}>✦</span>
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#c9a96e",
                fontWeight: 500
              }}
            >
              Private Membership
            </span>
            <span style={{ color: "#c9a96e", fontSize: "10px" }}>✦</span>
          </div>

          {/* Main Title */}
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 300,
              fontSize: "clamp(36px, 6vw, 64px)",
              color: "#fafaf8",
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.01em"
            }}
          >
            Join the <em style={{ color: "#e8d5b0", fontStyle: "italic" }}>Inner Circle</em>
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "14px",
              fontWeight: 300,
              color: "rgba(255, 255, 255, 0.6)",
              maxWidth: "480px",
              lineHeight: 1.6,
              marginBottom: "40px"
            }}
          >
            Receive private access to seasonal drops, atelier previews, and exclusive invitations directly to your inbox.
          </p>

          {/* Form & Success State */}
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: "rgba(201, 169, 110, 0.08)",
                  border: "1px solid rgba(201, 169, 110, 0.3)",
                  padding: "24px 36px",
                  maxWidth: "500px",
                  width: "100%"
                }}
              >
                <div style={{ color: "#c9a96e", fontSize: "20px", marginBottom: "8px" }}>✦</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "#fafaf8", marginBottom: "6px" }}>
                  Welcome to the Inner Circle
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", margin: 0 }}>
                  Your private invitation and 10% welcome code have been dispatched to <strong>{email}</strong>.
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  maxWidth: "520px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                  gap: "0"
                }}
              >
                <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    style={{
                      width: "100%",
                      height: "52px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(201, 169, 110, 0.3)",
                      borderRight: "none",
                      padding: "0 20px",
                      fontSize: "13px",
                      color: "#fafaf8",
                      outline: "none",
                      fontFamily: "DM Sans, sans-serif",
                      transition: "all 0.2s ease"
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#c9a96e")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(201, 169, 110, 0.3)")}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: "52px",
                    background: "#c9a96e",
                    color: "#0a0a0a",
                    border: "1px solid #c9a96e",
                    padding: "0 32px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.25s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dfc48e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#c9a96e";
                  }}
                >
                  {loading ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <span>Join Now</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Member Privileges Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
              paddingTop: "8px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.06em" }}>
              <span style={{ color: "#c9a96e" }}>✦</span> 10% Welcome Gift
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.06em" }}>
              <span style={{ color: "#c9a96e" }}>✦</span> Early VIP Drop Access
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", letterSpacing: "0.06em" }}>
              <span style={{ color: "#c9a96e" }}>✦</span> Zero Spam Guarantee
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}