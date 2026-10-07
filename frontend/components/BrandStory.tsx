// components/BrandStory.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

export default function BrandStory() {
  const [isDesktop, setIsDesktop] = useState(true);
  const [settings, setSettings] = useState({
    brand_top_label: "Our Philosophy",
    brand_title: "Designed with intention. Built to last.",
    brand_p1: "At AVIAR, we believe that true luxury lies in the details. Every thread, every seam, and every silhouette is meticulously considered to create garments that transcend fleeting trends.",
    brand_p2: "We source only the finest fabrics from ethical mills around the globe, ensuring that each piece not only looks extraordinary but feels sublime against the skin.",
    brand_stats: [
      { num: "5+", label: "Years crafting" },
      { num: "100%", label: "Premium materials" },
      { num: "98%", label: "Satisfaction rate" }
    ],
    brand_image: ""
  });

  useEffect(() => {
    fetch("/api/settings").then(res => res.json()).then(data => {
      setSettings(prev => {
        let stats = prev.brand_stats;
        if (data.brand_stats) {
          try {
            const parsed = JSON.parse(data.brand_stats);
            if (Array.isArray(parsed)) stats = parsed;
          } catch(e) {}
        }
        return {
          ...prev,
          ...data,
          brand_stats: stats
        };
      });
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section style={{ background: "#0a0a0a", padding: isDesktop ? "64px 48px" : "48px 20px", width: "100%", overflow: "hidden" }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto", display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "64px" : "40px", alignItems: "center" }}>

        {/* Left Visual */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "0.5px solid rgba(201,169,110,0.15)", overflow: "hidden" }}
        >
          {settings.brand_image ? (
            <Image src={settings.brand_image} alt="Brand Story" fill style={{ objectFit: "cover", opacity: 0.8 }} unoptimized />
          ) : (
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "100px", color: "rgba(201,169,110,0.08)", lineHeight: 1, userSelect: "none" }}>
              AV
            </div>
          )}
          <div style={{ position: "absolute", top: "20px", right: "20px", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", opacity: 0.7, zIndex: 10 }}>
            Est. 2010
          </div>
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ position: "absolute", bottom: 0, left: 0, height: "1px", background: "#c9a96e" }}
          />
        </motion.div>

        {/* Right Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <motion.div variants={itemVariants} style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "16px" }}>
            {settings.brand_top_label}
          </motion.div>

          <motion.h2 variants={itemVariants} style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, color: "#fafaf8", fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.1, marginBottom: "20px" }} dangerouslySetInnerHTML={{ __html: settings.brand_title.replace('intention', '<em>intention</em>') }} />

          <motion.div variants={itemVariants} style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.55)", display: "flex", flexDirection: "column", gap: "12px", maxWidth: "480px" }}>
            <p>{settings.brand_p1}</p>
            <p>{settings.brand_p2}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px", paddingTop: "24px", marginTop: "24px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}
          >
            {[...settings.brand_stats].map((stat: any, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", color: "#c9a96e", lineHeight: 1, marginBottom: "6px" }}>{stat.num}</span>
                <span style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}