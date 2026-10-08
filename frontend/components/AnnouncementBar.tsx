"use client";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "aviar_announcement_dismissed";

export default function AnnouncementBar() {
  const dismissed = useSyncExternalStore(
    () => () => {},
    () => {
      try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
    },
    () => false
  );
  const [closed, setClosed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const isVisible = !dismissed && !closed;

  useEffect(() => {
    const notifyHeight = () => {
      const h = (isVisible && barRef.current) ? barRef.current.offsetHeight : 0;
      document.documentElement.style.setProperty("--announcement-height", `${h}px`);
      window.dispatchEvent(new CustomEvent("announcement-height-change", { detail: h }));
    };

    notifyHeight();

    if (!isVisible) return;

    const ro = new ResizeObserver(notifyHeight);
    if (barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", notifyHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", notifyHeight);
      document.documentElement.style.setProperty("--announcement-height", "0px");
      window.dispatchEvent(new CustomEvent("announcement-height-change", { detail: 0 }));
    };
  }, [isVisible]);

  const handleClose = () => {
    setClosed(true);
    document.documentElement.style.setProperty("--announcement-height", "0px");
    window.dispatchEvent(new CustomEvent("announcement-height-change", { detail: 0 }));
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  if (!isVisible) return null;

  return (
    <div
      id="aviar-announcement-bar"
      ref={barRef}
      style={{
        background: "#0a0a0a",
        color: "#fafaf8",
        textAlign: "center",
        padding: "10px 40px 10px 16px",
        fontSize: "clamp(10px, 2.6vw, 11px)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        position: "relative",
        zIndex: 105,
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: "#c9a96e" }}>✦</span>
      {"  "}Free shipping over ৳150 — Use{" "}
      <span style={{ color: "#c9a96e", fontWeight: 600 }}>AVIAR10</span>
      {" "}for 10% off{"  "}
      <span style={{ color: "#c9a96e" }}>✦</span>
      <button
        onClick={handleClose}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          fontSize: "14px",
          lineHeight: 1,
          padding: "4px 8px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

