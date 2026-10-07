// app/about/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Image from "next/image";
import { motion } from "framer-motion";

interface StatItem {
  num: string;
  label: string;
}

interface ValueItem {
  title: string;
  desc: string;
}

const DEFAULT_STATS: StatItem[] = [
  { num: "5+", label: "Years of Craft" },
  { num: "100%", label: "Ethical Sourcing" },
  { num: "98%", label: "Customer Satisfaction" }
];

const DEFAULT_VALUES: ValueItem[] = [
  { title: "Quality", desc: "Every stitch, every seam is held to the highest standard. We never compromise on materials or craft." },
  { title: "Sustainability", desc: "We source responsibly, minimize waste, and partner only with suppliers who share our environmental values." },
  { title: "Timelessness", desc: "We design pieces that outlast trends. Our collections are meant to be worn for years, not just one season." }
];

export default function AboutPage() {
  const [settings, setSettings] = useState({
    about_hero_tag: "Our Story",
    about_hero_title: "Designed with intention.",
    about_hero_subtitle: "Built to last.",
    about_who_label: "Who We Are",
    about_quote: "AVIAR was founded on a simple belief — that clothing should be more than what you wear. It should be how you feel.",
    about_story_p1: "Every piece in our collection is crafted with the finest materials sourced from ethical suppliers around the world. We work with skilled artisans who share our commitment to quality, sustainability, and timeless design.",
    about_story_p2: "Our collections are designed to transcend seasons and trends. We believe in buying less and choosing better — pieces that become part of your story, worn for years, not weeks.",
    about_image: "",
    about_stats: "",
    about_values_label: "What We Stand For",
    about_values_title: "Our Values",
    about_values: ""
  });

  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [values, setValues] = useState<ValueItem[]>(DEFAULT_VALUES);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));

        if (data.about_stats) {
          try {
            const parsedStats = JSON.parse(data.about_stats);
            if (Array.isArray(parsedStats) && parsedStats.length > 0) {
              setStats(parsedStats);
            }
          } catch (e) {}
        }

        if (data.about_values) {
          try {
            const parsedValues = JSON.parse(data.about_values);
            if (Array.isArray(parsedValues) && parsedValues.length > 0) {
              setValues(parsedValues);
            }
          } catch (e) {}
        }
      })
      .catch(console.error);
  }, []);

  return (
    <PageTransition>
      <main style={{ background: "#fafaf8" }}>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />

        {/* Hero Section */}
        <section
          style={{
            background: "linear-gradient(180deg, #0a0a0a 0%, #151412 100%)",
            padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 48px)",
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
              height: "300px",
              background: "radial-gradient(ellipse at center, rgba(201, 169, 110, 0.08) 0%, transparent 70%)",
              pointerEvents: "none"
            }}
          />

          <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 10 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#c9a96e",
                marginBottom: "20px",
                fontWeight: 500
              }}
            >
              ✦ {settings.about_hero_tag || "Our Story"} ✦
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(42px, 7vw, 84px)",
                fontWeight: 300,
                color: "#fafaf8",
                lineHeight: 1.1,
                letterSpacing: "-0.01em"
              }}
            >
              {settings.about_hero_title || "Designed with intention."}
              <br />
              <em style={{ color: "#e8d5b0", fontStyle: "italic" }}>
                {settings.about_hero_subtitle || "Built to last."}
              </em>
            </motion.h1>
          </div>
        </section>

        {/* Narrative & Story Section */}
        <section style={{ padding: "clamp(60px, 8vw, 110px) clamp(20px, 5vw, 48px)" }}>
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: settings.about_image ? "repeat(auto-fit, minmax(340px, 1fr))" : "1fr",
              gap: "48px",
              alignItems: "center"
            }}
          >
            {/* Story Text */}
            <div>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#c9a96e",
                  marginBottom: "20px",
                  fontWeight: 600
                }}
              >
                {settings.about_who_label || "Who We Are"}
              </div>

              {settings.about_quote && (
                <p
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "clamp(22px, 3vw, 32px)",
                    fontWeight: 300,
                    lineHeight: 1.5,
                    color: "#0a0a0a",
                    marginBottom: "32px",
                    fontStyle: "italic",
                    borderLeft: "2px solid #c9a96e",
                    paddingLeft: "20px"
                  }}
                >
                  &ldquo;{settings.about_quote}&rdquo;
                </p>
              )}

              {settings.about_story_p1 && (
                <p style={{ fontSize: "15px", lineHeight: 1.9, color: "#4a4845", marginBottom: "20px" }}>
                  {settings.about_story_p1}
                </p>
              )}

              {settings.about_story_p2 && (
                <p style={{ fontSize: "15px", lineHeight: 1.9, color: "#4a4845", margin: 0 }}>
                  {settings.about_story_p2}
                </p>
              )}
            </div>

            {/* Optional Editorial Image */}
            {settings.about_image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/5",
                  background: "#f0ebe1",
                  border: "1px solid rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.06)"
                }}
              >
                <Image
                  src={settings.about_image}
                  alt="AVIAR Atelier"
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </motion.div>
            )}
          </div>
        </section>

        {/* Milestone Statistics Section */}
        <section
          style={{
            background: "#f5f2ec",
            padding: "clamp(48px, 7vw, 80px) clamp(20px, 5vw, 48px)",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            borderBottom: "1px solid rgba(0,0,0,0.05)"
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
              gap: "32px",
              textAlign: "center"
            }}
          >
            {stats.map((stat, idx) => (
              <div key={idx} style={{ padding: "16px" }}>
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "clamp(44px, 6vw, 64px)",
                    fontWeight: 300,
                    color: "#c9a96e",
                    lineHeight: 1
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#8a8680",
                    marginTop: "12px",
                    fontWeight: 500
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Values / Pillars Section */}
        <section
          style={{
            background: "#0a0a0a",
            padding: "clamp(64px, 10vw, 120px) clamp(20px, 5vw, 48px)",
            color: "#fafaf8"
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 72px)" }}>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#c9a96e",
                  marginBottom: "16px"
                }}
              >
                {settings.about_values_label || "What We Stand For"}
              </div>
              <h2
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(32px, 5vw, 56px)",
                  fontWeight: 300,
                  color: "#fafaf8"
                }}
              >
                {settings.about_values_title || "Our Values"}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "36px"
              }}
            >
              {values.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    borderTop: "1px solid rgba(201, 169, 110, 0.3)",
                    paddingTop: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "26px",
                      fontWeight: 300,
                      color: "#fafaf8",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    <span style={{ color: "#c9a96e", fontSize: "14px" }}>0{idx + 1}.</span>
                    <span>{val.title}</span>
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}