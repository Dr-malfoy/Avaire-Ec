// components/ExitPopup.tsx
"use client";
import { useState, useEffect, useRef, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ExitPopup() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 59);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    // Skip on touch / coarse-pointer devices — exit-intent doesn't work there
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !hasShown.current) {
        hasShown.current = true;
        setIsVisible(true);
      }
    };

    const timer = setTimeout(() => {
      if (!hasShown.current) {
        hasShown.current = true;
        setIsVisible(true);
      }
    }, 25000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const copyCode = () => {
    try { navigator.clipboard.writeText("AVIAR15"); } catch {}
    setToastMsg("Code AVIAR15 copied! 🎉");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setIsVisible(false);
  };

  // All hooks done — now safe to early-return on suppress paths
  const SUPPRESS_ON = ["/admin", "/track", "/dashboard", "/order/", "/checkout", "/cart"];
  if (SUPPRESS_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsVisible(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 300,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                maxWidth: "480px", width: "90%",
                padding: "56px 48px",
                textAlign: "center",
                position: "relative",
              }}
            >
              <button
                onClick={() => setIsVisible(false)}
                style={{
                  position: "absolute", top: "20px", right: "20px",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "18px", color: "var(--muted)",
                }}
              >✕</button>

              <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "16px" }}>
                Wait — don&apos;t go yet
              </div>

              <h2 className="font-display" style={{ fontSize: "48px", fontWeight: 300, lineHeight: 1.1, marginBottom: "16px", color: "var(--black)" }}>
                Get <em style={{ color: "var(--gold)" }}>15% off</em><br />your first order
              </h2>

              <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "24px" }}>
                Use this code at checkout. Offer expires in:
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                {[minutes, seconds].map((val, i) => (
                  <Fragment key={i}>
                    {i === 1 && <span className="font-display" style={{ fontSize: "48px", color: "var(--gold)" }}>:</span>}
                    <div style={{ textAlign: "center" }}>
                      <div className="font-display" style={{ fontSize: "48px", color: "var(--gold)", lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>{i === 0 ? "Min" : "Sec"}</div>
                    </div>
                  </Fragment>
                ))}
              </div>

              <div
                onClick={copyCode}
                style={{
                  border: "1px solid var(--gold)",
                  padding: "16px 32px",
                  display: "inline-block",
                  marginBottom: "24px",
                  cursor: "pointer",
                }}
              >
                <div className="font-display" style={{ fontSize: "28px", letterSpacing: "0.2em" }}>AVIAR15</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>Click to copy</div>
              </div>

              <button
                onClick={copyCode}
                style={{
                  display: "block", width: "100%",
                  background: "var(--gold)", color: "var(--black)",
                  border: "none", padding: "14px",
                  fontSize: "12px", letterSpacing: "0.12em",
                  textTransform: "uppercase", cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                Copy Code &amp; Shop
              </button>

              <button
                onClick={() => setIsVisible(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--muted)", textDecoration: "underline" }}
              >
                No thanks, I&apos;ll pay full price
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed", bottom: "32px", left: "50%",
              transform: "translateX(-50%)",
              background: "var(--black)", color: "var(--white)",
              padding: "12px 24px", fontSize: "13px",
              zIndex: 400, whiteSpace: "nowrap",
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}