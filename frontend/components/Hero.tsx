// components/Hero.tsx
"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface HeroSlide {
  url: string;
  title?: string;
  price?: string | number;
  subtitle?: string;
  link?: string;
}

type BgProduct = { icon: string; name: string; price: number };

const BG_PRODUCTS: BgProduct[] = [
  { icon: "👚", name: "Silk Wrap Blouse", price: 295 },
  { icon: "🧥", name: "Cashmere Turtleneck", price: 450 },
  { icon: "👜", name: "Leather Crossbody", price: 320 },
  { icon: "👖", name: "Tailored Trousers", price: 250 },
  { icon: "👒", name: "Woven Sun Hat", price: 95 },
];

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [settings, setSettings] = useState({
    hero_top_label: "New Collection 2025",
    hero_title: "Wear the",
    hero_subtitle: "Difference",
    hero_description: "Premium clothing crafted for those who demand excellence",
    hero_cta_primary: "Shop Collection",
    hero_cta_primary_link: "/shop",
    hero_cta_secondary: "Our Story",
    hero_cta_secondary_link: "/about",
    hero_images: "[]"
  });

  // Normalize dynamic hero slides
  let heroSlides: HeroSlide[] = [];
  try {
    const parsed = JSON.parse(settings.hero_images);
    if (Array.isArray(parsed)) {
      heroSlides = parsed
        .map((item: any) => {
          if (typeof item === "string") {
            return { url: item, title: "", price: "" };
          }
          return {
            url: item?.url || "",
            title: item?.title || "",
            price: item?.price !== undefined ? String(item.price) : "",
            subtitle: item?.subtitle || "",
            link: item?.link || "/shop"
          };
        })
        .filter((s: HeroSlide) => Boolean(s.url));
    }
  } catch (e) {}

  const useDynamicImages = heroSlides.length > 0;
  const numSlides = useDynamicImages ? heroSlides.length : BG_PRODUCTS.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -50]);

  useEffect(() => {
    if (numSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % numSlides);
    }, 4500);
    return () => clearInterval(interval);
  }, [numSlides]);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const currentSlide = useDynamicImages ? heroSlides[currentProduct % heroSlides.length] : null;

  return (
    <section ref={containerRef} style={{ height: isDesktop ? "150vh" : "100vh", position: "relative", width: "100%" }}>
      <div style={{ height: "100vh", position: "sticky", top: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #0a0a0a 0%, #1c1a17 50%, #2a2520 100%)" }}>

        {/* Background Slideshow */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <AnimatePresence mode="wait">
            {useDynamicImages && currentSlide ? (
              <motion.div
                key={currentSlide.url}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.42, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0 }}
              >
                <Image
                  src={currentSlide.url}
                  alt={currentSlide.title || "Hero Visual"}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                  priority
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentProduct}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.06, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                style={{ fontSize: "clamp(200px, 35vw, 420px)", lineHeight: 1, userSelect: "none", position: "absolute" }}
              >
                {BG_PRODUCTS[currentProduct % BG_PRODUCTS.length]?.icon}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle Dark Gradient Overlay for text legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.85) 100%)",
            pointerEvents: "none"
          }}
        />

        {/* Indicator dots */}
        {numSlides > 1 && (
          <div style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 15 }}>
            {Array.from({ length: numSlides }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentProduct(i)}
                style={{
                  width: i === currentProduct ? "28px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === currentProduct ? "#c9a96e" : "rgba(255,255,255,0.35)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0
                }}
              />
            ))}
          </div>
        )}

        {/* Decorative Luxury Rings */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
          <div style={{ width: "min(560px, 90vw)", height: "min(560px, 90vw)", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.15)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateCW 30s linear infinite" }} />
          <div style={{ width: "min(380px, 62vw)", height: "min(380px, 62vw)", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.1)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateCCW 20s linear infinite" }} />
        </div>

        {/* Main Hero Content */}
        <motion.div style={{ opacity, y, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", width: "100%" }}>

          {/* Top Label Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ color: "#c9a96e", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "20px" }}
          >
            {settings.hero_top_label}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, color: "#fafaf8", lineHeight: 1, marginBottom: "16px", fontSize: "clamp(52px,8vw,100px)" }}
          >
            {settings.hero_title}
            <br />
            <em style={{ color: "#e8d5b0" }}>{settings.hero_subtitle}</em>
          </motion.h1>

          {/* Dynamic Slide Product Tag / Detail (Shows name & price) */}
          <AnimatePresence mode="wait">
            {useDynamicImages ? (
              currentSlide && (currentSlide.title || currentSlide.price) && (
                <motion.div
                  key={`slide-${currentProduct}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {currentSlide.title && <span>{currentSlide.title}</span>}
                  {currentSlide.price && (
                    <span style={{ color: "#c9a96e", fontWeight: 600 }}>
                      — {currentSlide.price.toString().startsWith("?") ? currentSlide.price : `৳${currentSlide.price}`}
                    </span>
                  )}
                </motion.div>
              )
            ) : (
              <motion.div
                key={currentProduct}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                style={{ fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}
              >
                {BG_PRODUCTS[currentProduct % BG_PRODUCTS.length]?.name} — ৳{BG_PRODUCTS[currentProduct % BG_PRODUCTS.length]?.price}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{ fontSize: "14px", fontWeight: 300, color: "rgba(255,255,255,0.6)", marginBottom: "40px", maxWidth: "440px", lineHeight: 1.6 }}
          >
            {settings.hero_description}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
          >
            <Link
              href={settings.hero_cta_primary_link || "/shop"}
              style={{
                background: "#c9a96e",
                color: "#0a0a0a",
                padding: "14px 32px",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
                minWidth: isDesktop ? "160px" : "140px",
                textAlign: "center",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {settings.hero_cta_primary || "Shop Collection"}
            </Link>
            <Link
              href={settings.hero_cta_secondary_link || "/about"}
              style={{
                background: "transparent",
                border: "0.5px solid rgba(255,255,255,0.3)",
                color: "rgba(255,255,255,0.85)",
                padding: "14px 32px",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
                minWidth: isDesktop ? "160px" : "140px",
                textAlign: "center",
                transition: "all 0.2s"
              }}
            >
              {settings.hero_cta_secondary || "Our Story"}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 10 }}
        >
          <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Scroll</span>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, #c9a96e, transparent)" }}
          />
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes rotateCW { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes rotateCCW { to { transform: translate(-50%, -50%) rotate(-360deg); } }
      `}</style>
    </section>
  );
}
