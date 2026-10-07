"use client";
import { useState, useSyncExternalStore } from "react";

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

  const handleClose = () => {
    setClosed(true);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  if (dismissed || closed) return null;

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#fafaf8",
        textAlign: "center",
        padding: "10px 40px 10px 16px",
        fontSize: "clamp(10px, 2.6vw, 11px)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        position: "relative",
        zIndex: 200,
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

