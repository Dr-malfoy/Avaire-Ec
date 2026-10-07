// app/admin/login/page.tsx
"use client";
import { useState, type SyntheticEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { saveAdminSession } from "@/lib/adminAuth";
import { getApiUrl } from "@/lib/api";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) throw new Error(data.message || "Login failed");
      saveAdminSession(data.token);
      // Go back to the page the admin originally wanted (only internal /admin paths)
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/admin/") && !next.startsWith("/admin/login") ? next : "/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main data-admin="true" style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "420px", padding: "0 24px" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div className="font-display" style={{ fontSize: "32px", letterSpacing: "0.15em", color: "var(--white)" }}>AVIAR</div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginTop: "8px" }}>Admin Portal</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--white)", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ padding: "14px 16px", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "var(--white)", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
          />

          {error && (
            <div style={{ fontSize: "12px", color: "#c0392b", textAlign: "center" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "8px", background: "var(--gold)", color: "var(--black)", border: "none", padding: "16px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}