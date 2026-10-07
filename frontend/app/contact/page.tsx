// app/contact/page.tsx
"use client";
import { useState, useEffect, type SyntheticEvent, type CSSProperties } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const [settings, setSettings] = useState({
    contact_hero_tag: "Get In Touch",
    contact_hero_title: "We'd love to",
    contact_hero_subtitle: "hear from you",
    contact_info_tag: "Contact Information",
    contact_info_title: "Let's start a",
    contact_info_subtitle: "conversation",
    contact_info_desc: "Have a question about our bespoke products, order status, or concierge styling? Our team is dedicated to assisting you.",
    contact_email: "hello@aviarbd.com",
    contact_phone: "+880 1700 000000",
    contact_address: "Dhaka, Bangladesh",
    contact_hours: "Mon–Fri, 9am–6pm BST"
  });

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings((prev) => ({ ...prev, ...data })))
      .catch(console.error);
  }, []);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 600);
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "16px 18px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "#fafaf8",
    fontSize: "13px",
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
    color: "#0a0a0a",
    marginBottom: "16px",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  };

  const contactItems = [
    { label: "Email Concierge", value: settings.contact_email, icon: "✉" },
    { label: "Phone / WhatsApp", value: settings.contact_phone, icon: "✆" },
    { label: "Atelier Flagship", value: settings.contact_address, icon: "⚲" },
    { label: "Client Hours", value: settings.contact_hours, icon: "⏱" }
  ];

  return (
    <PageTransition>
      <main style={{ background: "#fafaf8" }}>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />

        {/* Hero Section */}
        <section
          style={{
            background: "linear-gradient(180deg, #0a0a0a 0%, #151412 100%)",
            padding: isDesktop ? "90px 48px" : "64px 20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid rgba(201, 169, 110, 0.2)"
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(600px, 90vw)",
              height: "260px",
              background: "radial-gradient(ellipse at center, rgba(201, 169, 110, 0.08) 0%, transparent 70%)",
              pointerEvents: "none"
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: "relative", zIndex: 10, maxWidth: "700px", margin: "0 auto" }}
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#c9a96e",
                marginBottom: "16px",
                fontWeight: 500
              }}
            >
              ✦ {settings.contact_hero_tag || "Get In Touch"} ✦
            </div>
            <h1
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(38px, 5.5vw, 76px)",
                fontWeight: 300,
                color: "#fafaf8",
                lineHeight: 1.1,
                letterSpacing: "-0.01em"
              }}
            >
              {settings.contact_hero_title || "We'd love to"}{" "}
              <em style={{ color: "#e8d5b0", fontStyle: "italic" }}>
                {settings.contact_hero_subtitle || "hear from you"}
              </em>
            </h1>
          </motion.div>
        </section>

        {/* Content Details & Form */}
        <section style={{ padding: isDesktop ? "100px 48px" : "60px 20px" }}>
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: isDesktop ? "1fr 1.1fr" : "1fr",
              gap: isDesktop ? "80px" : "48px",
              alignItems: "start"
            }}
          >
            {/* Left: Contact Information Cards */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#c9a96e",
                  marginBottom: "16px",
                  fontWeight: 600
                }}
              >
                {settings.contact_info_tag || "Contact Information"}
              </div>
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(30px, 3.5vw, 44px)",
                  fontWeight: 300,
                  color: "#0a0a0a",
                  marginBottom: "20px",
                  lineHeight: 1.2
                }}
              >
                {settings.contact_info_title || "Let's start a"}{" "}
                <em style={{ color: "#c9a96e", fontStyle: "italic" }}>
                  {settings.contact_info_subtitle || "conversation"}
                </em>
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#5a5650", marginBottom: "40px", maxWidth: "460px" }}>
                {settings.contact_info_desc}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {contactItems.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.06)",
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#8a8680",
                          marginBottom: "4px"
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: "15px", color: "#0a0a0a", fontWeight: 500 }}>
                        {item.value}
                      </div>
                    </div>
                    <span style={{ color: "#c9a96e", fontSize: "16px" }}>{item.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Message Form */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.08)",
                padding: isDesktop ? "48px" : "32px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.04)"
              }}
            >
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(201,169,110,0.15)",
                      color: "#c9a96e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      margin: "0 auto 20px"
                    }}
                  >
                    ✓
                  </div>
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "30px",
                      fontWeight: 300,
                      color: "#0a0a0a",
                      marginBottom: "10px"
                    }}
                  >
                    Message Dispatched
                  </div>
                  <p style={{ fontSize: "14px", color: "#6a6660", lineHeight: 1.6, maxWidth: "340px", margin: "0 auto 24px" }}>
                    Thank you for contacting AVIAR. Our client concierge will review your message and respond within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(0,0,0,0.2)",
                      padding: "10px 24px",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      cursor: "pointer"
                    }}
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "26px",
                      fontWeight: 300,
                      marginBottom: "24px",
                      color: "#0a0a0a"
                    }}
                  >
                    Send a <em>Direct Inquiry</em>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "12px" }}>
                    <div>
                      <input
                        placeholder="Your Full Name *"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#0a0a0a")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#0a0a0a")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
                      />
                    </div>
                  </div>

                  <input
                    placeholder="Subject (e.g. Order #1042 / Bespoke Sizing) *"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#0a0a0a")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
                  />

                  <textarea
                    placeholder="Write your note or inquiry details here... *"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={(e) => (e.target.style.borderColor = "#0a0a0a")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      width: "100%",
                      background: "#0a0a0a",
                      color: "#fafaf8",
                      border: "none",
                      padding: "16px",
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      cursor: sending ? "not-allowed" : "pointer",
                      opacity: sending ? 0.7 : 1,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {sending ? "Sending Message..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
