"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { authFetch } from "@/lib/authFetch";

export interface HeroSlide {
  id?: string;
  url: string;
  title: string;
  price: string;
  subtitle?: string;
  link?: string;
}

export interface BrandStat {
  num: string;
  label: string;
}

export interface AboutValue {
  title: string;
  desc: string;
}

export default function StorefrontSettingsPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "contact" | "footer" | "brand" | "marquee" | "identity">("hero");

  const [settings, setSettings] = useState({
    // Global Identity
    site_logo: "",

    // Homepage Hero
    hero_top_label: "New Collection 2025",
    hero_title: "Wear the",
    hero_subtitle: "Difference",
    hero_description: "Premium clothing crafted for those who demand excellence",
    hero_cta_primary: "Shop Collection",
    hero_cta_primary_link: "/shop",
    hero_cta_secondary: "Our Story",
    hero_cta_secondary_link: "/about",
    hero_images: "[]",

    // Homepage Marquee
    marquee_phrases: '["Free shipping on orders over ৳150", "New Arrivals Every Monday", "Ethically Sourced Materials", "30-Day Returns, No Questions", "Crafted by Artisans"]',

    // Homepage Brand Story
    brand_top_label: "Our Philosophy",
    brand_title: "Designed with intention. Built to last.",
    brand_p1: "At AVIAR, we believe that true luxury lies in the details. Every thread, every seam, and every silhouette is meticulously considered to create garments that transcend fleeting trends.",
    brand_p2: "We source only the finest fabrics from ethical mills around the globe, ensuring that each piece not only looks extraordinary but feels sublime against the skin.",
    brand_stats: '[{"num":"5+","label":"Years crafting"}, {"num":"100%","label":"Premium materials"}, {"num":"98%","label":"Satisfaction rate"}]',
    brand_image: "",

    // Dedicated About Page (/about)
    about_hero_tag: "Our Story",
    about_hero_title: "Designed with intention.",
    about_hero_subtitle: "Built to last.",
    about_who_label: "Who We Are",
    about_quote: "AVIAR was founded on a simple belief — that clothing should be more than what you wear. It should be how you feel.",
    about_story_p1: "Every piece in our collection is crafted with the finest materials sourced from ethical suppliers around the world. We work with skilled artisans who share our commitment to quality, sustainability, and timeless design.",
    about_story_p2: "Our collections are designed to transcend seasons and trends. We believe in buying less and choosing better — pieces that become part of your story, worn for years, not weeks.",
    about_image: "",
    about_stats: '[{"num":"5+","label":"Years of Craft"}, {"num":"100%","label":"Ethical Sourcing"}, {"num":"98%","label":"Customer Satisfaction"}]',
    about_values_label: "What We Stand For",
    about_values_title: "Our Values",
    about_values: '[{"title":"Quality","desc":"Every stitch, every seam is held to the highest standard. We never compromise on materials or craft."},{"title":"Sustainability","desc":"We source responsibly, minimize waste, and partner only with suppliers who share our environmental values."},{"title":"Timelessness","desc":"We design pieces that outlast trends. Our collections are meant to be worn for years, not just one season."}]',

    // Contact Page (/contact)
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
    contact_hours: "Mon–Fri, 9am–6pm BST",

    // Footer Section
    footer_tagline: "Timeless design, exceptional craft. Luxury that respects the planet.",
    footer_copyright: "AVIAR. All rights reserved to mystrixit.site",
    footer_subtext: "Crafted by Samrise Digital",
    footer_instagram: "https://instagram.com",
    footer_pinterest: "https://pinterest.com",
    footer_tiktok: "https://tiktok.com",
    footer_facebook: "",
    footer_twitter: "",
    footer_newsletter_title: "Stay in the loop",
    footer_newsletter_btn: "Join our newsletter →"
  });

  // Parsed structured states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [marqueeList, setMarqueeList] = useState<string[]>([]);
  const [brandStatsList, setBrandStatsList] = useState<BrandStat[]>([]);
  const [aboutStatsList, setAboutStatsList] = useState<BrandStat[]>([]);
  const [aboutValuesList, setAboutValuesList] = useState<AboutValue[]>([]);

  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const parseJsonSafe = <T,>(val: string | undefined, fallback: T): T => {
    if (!val) return fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => {
          const updated = { ...prev, ...data };

          // Normalize hero slides
          const rawHero = parseJsonSafe<any[]>(updated.hero_images, []);
          const normalizedHero: HeroSlide[] = Array.isArray(rawHero)
            ? rawHero.map((item, idx) => {
                if (typeof item === "string") {
                  return { id: `slide-${idx}-${Date.now()}`, url: item, title: "", price: "", subtitle: "", link: "/shop" };
                }
                return {
                  id: item.id || `slide-${idx}-${Date.now()}`,
                  url: item.url || "",
                  title: item.title || "",
                  price: item.price !== undefined ? String(item.price) : "",
                  subtitle: item.subtitle || "",
                  link: item.link || "/shop"
                };
              })
            : [];
          setHeroSlides(normalizedHero);

          // Normalize marquee
          const rawMarquee = parseJsonSafe<string[]>(updated.marquee_phrases, []);
          setMarqueeList(Array.isArray(rawMarquee) ? rawMarquee : []);

          // Normalize brand stats
          const rawStats = parseJsonSafe<BrandStat[]>(updated.brand_stats, []);
          setBrandStatsList(Array.isArray(rawStats) ? rawStats : []);

          // Normalize about stats
          const rawAboutStats = parseJsonSafe<BrandStat[]>(updated.about_stats, []);
          setAboutStatsList(Array.isArray(rawAboutStats) ? rawAboutStats : []);

          // Normalize about values
          const rawAboutValues = parseJsonSafe<AboutValue[]>(updated.about_values, []);
          setAboutValuesList(Array.isArray(rawAboutValues) ? rawAboutValues : []);

          return updated;
        });
      }
    } catch (e) {
      console.error("Failed to fetch settings", e);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, section = "storefront"): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("section", section);

    const res = await authFetch("/api/admin/upload", {
      method: "POST",
      body: fd
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(err.message || "Upload failed");
    }

    const data = await res.json();
    return data.url;
  };

  const handleSingleImageUpload = async (file: File, key: "site_logo" | "brand_image" | "about_image") => {
    setUploadingState(p => ({ ...p, [key]: true }));
    try {
      const url = await uploadFile(file);
      setSettings(prev => ({ ...prev, [key]: url }));
      showToast("Image uploaded successfully");
    } catch (e: any) {
      showToast(e.message || "Upload failed", false);
    } finally {
      setUploadingState(p => ({ ...p, [key]: false }));
    }
  };

  // Hero Upload
  const handleMultipleHeroUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingState(p => ({ ...p, hero_images: true }));

    const fileArray = Array.from(files);
    let successCount = 0;

    try {
      const uploadedSlides: HeroSlide[] = await Promise.all(
        fileArray.map(async (file, idx) => {
          const url = await uploadFile(file, "hero");
          successCount++;
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const formattedTitle = nameWithoutExt.length > 25 ? nameWithoutExt.substring(0, 25) : nameWithoutExt;
          return {
            id: `slide-${Date.now()}-${idx}`,
            url,
            title: formattedTitle,
            price: "",
            subtitle: "",
            link: "/shop"
          };
        })
      );

      setHeroSlides(prev => [...prev, ...uploadedSlides]);
      showToast(`Uploaded ${successCount} hero slide${successCount > 1 ? "s" : ""}`);
    } catch (e: any) {
      showToast(e.message || "Failed to upload some images", false);
    } finally {
      setUploadingState(p => ({ ...p, hero_images: false }));
    }
  };

  const handleReplaceHeroImage = async (file: File, index: number) => {
    setUploadingState(p => ({ ...p, [`hero_replace_${index}`]: true }));
    try {
      const url = await uploadFile(file, "hero");
      setHeroSlides(prev => prev.map((s, i) => (i === index ? { ...s, url } : s)));
      showToast("Slide image replaced");
    } catch (e: any) {
      showToast(e.message || "Replace failed", false);
    } finally {
      setUploadingState(p => ({ ...p, [`hero_replace_${index}`]: false }));
    }
  };

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides(prev => prev.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide)));
  };

  const removeHeroSlide = (index: number) => {
    setHeroSlides(prev => prev.filter((_, i) => i !== index));
    showToast("Slide removed");
  };

  const moveHeroSlide = (index: number, direction: "up" | "down") => {
    setHeroSlides(prev => {
      const copy = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const [removed] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
  };

  const addManualSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        url: "",
        title: "New Featured Item",
        price: "250",
        subtitle: "Luxury Collection",
        link: "/shop"
      }
    ]);
  };

  // Marquee
  const addMarqueePhrase = () => setMarqueeList(prev => [...prev, "New Luxury Announcement"]);
  const updateMarqueePhrase = (idx: number, val: string) => setMarqueeList(prev => prev.map((item, i) => (i === idx ? val : item)));
  const removeMarqueePhrase = (idx: number) => setMarqueeList(prev => prev.filter((_, i) => i !== idx));

  // Brand Stats
  const addBrandStat = () => setBrandStatsList(prev => [...prev, { num: "100%", label: "Handcrafted Quality" }]);
  const updateBrandStat = (idx: number, field: "num" | "label", val: string) => setBrandStatsList(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  const removeBrandStat = (idx: number) => setBrandStatsList(prev => prev.filter((_, i) => i !== idx));

  // About Stats
  const addAboutStat = () => setAboutStatsList(prev => [...prev, { num: "500+", label: "Master Craftsmen" }]);
  const updateAboutStat = (idx: number, field: "num" | "label", val: string) => setAboutStatsList(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  const removeAboutStat = (idx: number) => setAboutStatsList(prev => prev.filter((_, i) => i !== idx));

  // About Values
  const addAboutValue = () => setAboutValuesList(prev => [...prev, { title: "Artisanship", desc: "Honoring centuries of textile mastery in every piece." }]);
  const updateAboutValue = (idx: number, field: "title" | "desc", val: string) => setAboutValuesList(prev => prev.map((v, i) => (i === idx ? { ...v, [field]: val } : v)));
  const removeAboutValue = (idx: number) => setAboutValuesList(prev => prev.filter((_, i) => i !== idx));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...settings,
        hero_images: JSON.stringify(heroSlides),
        marquee_phrases: JSON.stringify(marqueeList),
        brand_stats: JSON.stringify(brandStatsList),
        about_stats: JSON.stringify(aboutStatsList),
        about_values: JSON.stringify(aboutValuesList)
      };

      const res = await authFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("All storefront settings updated successfully");
      } else {
        showToast("Failed to save settings", false);
      }
    } catch (e) {
      showToast("An error occurred while saving", false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, display: "flex", alignItems: "center", gap: 12, color: "#8a8680" }}>
        <div style={{ width: 16, height: 16, border: "2px solid #c9a96e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span>Loading storefront customizer...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    padding: "36px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    marginBottom: "32px",
    borderTop: "3px solid #c9a96e"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#8a8680",
    marginBottom: "8px",
    display: "block",
    fontWeight: 600
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "#fafaf8",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "13px",
    color: "#0a0a0a",
    marginBottom: "16px",
    outline: "none"
  };

  const tabs = [
    { id: "hero", label: "Hero Banner" },
    { id: "about", label: "About (/about)" },
    { id: "contact", label: "Contact (/contact)" },
    { id: "footer", label: "Footer & Socials" },
    { id: "brand", label: "Brand Story (Home)" },
    { id: "marquee", label: "Marquee Ticker" },
    { id: "identity", label: "Logo & Identity" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "40px 40px 120px", maxWidth: "1240px" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Storefront Customizer</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a", margin: 0 }}>Visuals, Stories & <em>Content</em></h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            background: "#0a0a0a",
            color: "#fafaf8",
            border: "none",
            padding: "14px 32px",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(0,0,0,0.1)", marginBottom: "32px", flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 18px",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #c9a96e" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.id ? "#0a0a0a" : "#8a8680",
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {/* TAB 1: HERO BANNER */}
        {activeTab === "hero" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: 0, fontWeight: 400 }}>Hero Slider & Multi-Images</h2>
                  <span style={{ fontSize: "11px", background: "#f5f2ec", color: "#c9a96e", padding: "3px 8px", fontWeight: 600, borderRadius: 2 }}>
                    {heroSlides.length} Slide{heroSlides.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#8a8680", marginTop: "4px", marginBottom: 0 }}>
                  Upload multiple background photos with dynamic product names, prices, and tags.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => handleMultipleHeroUpload(e.target.files)}
                  style={{ display: "none" }}
                  id="hero_multi_upload"
                />
                <label
                  htmlFor="hero_multi_upload"
                  style={{
                    background: "#0a0a0a",
                    color: "#fafaf8",
                    padding: "10px 18px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: uploadingState.hero_images ? 0.6 : 1
                  }}
                >
                  <span>+</span> {uploadingState.hero_images ? "Uploading..." : "Upload Multiple Images"}
                </label>
                <button
                  type="button"
                  onClick={addManualSlide}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0,0,0,0.2)",
                    color: "#0a0a0a",
                    padding: "10px 16px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer"
                  }}
                >
                  + Add Slide Entry
                </button>
              </div>
            </div>

            {/* Slide Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              {heroSlides.length === 0 ? (
                <div style={{ padding: "40px", border: "1px dashed rgba(0,0,0,0.15)", textAlign: "center", background: "#fafaf8" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0a0a0a", marginBottom: "4px" }}>No Hero Slides Configured</div>
                  <div style={{ fontSize: "12px", color: "#8a8680", marginBottom: "16px" }}>The hero will automatically use default aesthetic fallback icons until images are uploaded.</div>
                  <label
                    htmlFor="hero_multi_upload"
                    style={{
                      background: "#c9a96e",
                      color: "#0a0a0a",
                      padding: "10px 20px",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      display: "inline-block",
                      fontWeight: 600
                    }}
                  >
                    Upload Hero Images
                  </label>
                </div>
              ) : (
                heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    style={{
                      border: "1px solid rgba(0,0,0,0.1)",
                      background: "#fafaf8",
                      padding: "20px",
                      display: "grid",
                      gridTemplateColumns: "140px 1fr auto",
                      gap: "20px",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ position: "relative", width: "140px", height: "100px", background: "#eae6df", overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
                        {slide.url ? (
                          <Image src={slide.url} alt={`Slide ${idx + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "11px", color: "#8a8680" }}>
                            No image
                          </div>
                        )}
                        <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(10,10,10,0.75)", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: 2 }}>
                          Slide #{idx + 1}
                        </div>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`replace_slide_${idx}`}
                          style={{ display: "none" }}
                          onChange={e => e.target.files?.[0] && handleReplaceHeroImage(e.target.files[0], idx)}
                        />
                        <label
                          htmlFor={`replace_slide_${idx}`}
                          style={{
                            fontSize: "10px",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: "#c9a96e",
                            cursor: "pointer",
                            display: "block",
                            textAlign: "center"
                          }}
                        >
                          {uploadingState[`hero_replace_${idx}`] ? "Uploading..." : "Change Image"}
                        </label>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <span style={labelStyle}>Product / Slide Title</span>
                        <input
                          placeholder="e.g. Silk Wrap Blouse"
                          value={slide.title}
                          onChange={e => updateHeroSlide(idx, "title", e.target.value)}
                          style={{ ...inputStyle, marginBottom: 0 }}
                        />
                      </div>
                      <div>
                        <span style={labelStyle}>Price / Badge (e.g. 295)</span>
                        <input
                          placeholder="e.g. 295 or New Drop"
                          value={slide.price}
                          onChange={e => updateHeroSlide(idx, "price", e.target.value)}
                          style={{ ...inputStyle, marginBottom: 0 }}
                        />
                      </div>
                      <div>
                        <span style={labelStyle}>Subtitle / Material (Optional)</span>
                        <input
                          placeholder="e.g. 100% Pure Cashmere"
                          value={slide.subtitle || ""}
                          onChange={e => updateHeroSlide(idx, "subtitle", e.target.value)}
                          style={{ ...inputStyle, marginBottom: 0 }}
                        />
                      </div>
                      <div>
                        <span style={labelStyle}>Image URL (Direct link)</span>
                        <input
                          placeholder="https://... or /api/uploads/..."
                          value={slide.url}
                          onChange={e => updateHeroSlide(idx, "url", e.target.value)}
                          style={{ ...inputStyle, marginBottom: 0 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveHeroSlide(idx, "up")}
                        style={{ padding: "6px 10px", background: "rgba(0,0,0,0.06)", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.3 : 1, fontSize: "11px" }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === heroSlides.length - 1}
                        onClick={() => moveHeroSlide(idx, "down")}
                        style={{ padding: "6px 10px", background: "rgba(0,0,0,0.06)", border: "none", cursor: idx === heroSlides.length - 1 ? "not-allowed" : "pointer", opacity: idx === heroSlides.length - 1 ? 0.3 : 1, fontSize: "11px" }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removeHeroSlide(idx)}
                        style={{ padding: "6px 10px", background: "rgba(192,57,43,0.1)", color: "#c0392b", border: "none", cursor: "pointer", fontSize: "11px", marginTop: "4px" }}
                        title="Delete Slide"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "24px 0" }} />

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: "16px" }}>Hero Text & Call To Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Top Badge Label</label>
                <input name="hero_top_label" value={settings.hero_top_label} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description Text</label>
                <input name="hero_description" value={settings.hero_description} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Main Title (First Line)</label>
                <input name="hero_title" value={settings.hero_title} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Subtitle / Highlight (Italicized)</label>
                <input name="hero_subtitle" value={settings.hero_subtitle} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED ABOUT PAGE (/about) */}
        {activeTab === "about" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "0 0 4px", fontWeight: 400 }}>Dedicated About Page (/about)</h2>
                <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Control narrative headlines, editorial photography, milestones, and brand values.</p>
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: "16px", color: "#c9a96e" }}>1. Hero Header</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Header Tagline</label>
                <input name="about_hero_tag" value={settings.about_hero_tag} onChange={handleChange} style={inputStyle} placeholder="Our Story" />
              </div>
              <div>
                <label style={labelStyle}>Headline (Main Line)</label>
                <input name="about_hero_title" value={settings.about_hero_title} onChange={handleChange} style={inputStyle} placeholder="Designed with intention." />
              </div>
              <div>
                <label style={labelStyle}>Headline (Second Line / Italic)</label>
                <input name="about_hero_subtitle" value={settings.about_hero_subtitle} onChange={handleChange} style={inputStyle} placeholder="Built to last." />
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginTop: "16px", marginBottom: "16px", color: "#c9a96e" }}>2. Brand Story & Narrative</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Who We Are Tag</label>
                <input name="about_who_label" value={settings.about_who_label} onChange={handleChange} style={inputStyle} placeholder="Who We Are" />
                
                <label style={labelStyle}>Editorial Story Image</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  {settings.about_image ? (
                    <div style={{ position: "relative", width: "100%", height: 180, background: "#f5f2ec", border: "1px solid rgba(0,0,0,0.1)", overflow: "hidden" }}>
                      <Image src={settings.about_image} alt="About Editorial" fill style={{ objectFit: "cover" }} unoptimized />
                      <button
                        type="button"
                        onClick={() => setSettings(p => ({ ...p, about_image: "" }))}
                        style={{ position: "absolute", top: 8, right: 8, background: "#c0392b", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: "12px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 120, border: "1px dashed rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#8a8680" }}>
                      No image uploaded (Optional)
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], "about_image")}
                      style={{ display: "none" }}
                      id="about_image_upload"
                    />
                    <label
                      htmlFor="about_image_upload"
                      style={{
                        background: "#0a0a0a",
                        color: "#fafaf8",
                        padding: "8px 16px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        display: "inline-block",
                        opacity: uploadingState.about_image ? 0.6 : 1
                      }}
                    >
                      {uploadingState.about_image ? "Uploading..." : settings.about_image ? "Replace Image" : "Upload Image"}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Lead Large Quote / Thesis</label>
                <textarea name="about_quote" value={settings.about_quote} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

                <label style={labelStyle}>Story Paragraph 1</label>
                <textarea name="about_story_p1" value={settings.about_story_p1} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />

                <label style={labelStyle}>Story Paragraph 2</label>
                <textarea name="about_story_p2" value={settings.about_story_p2} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>

            <div style={{ marginTop: "24px", marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", margin: 0, color: "#c9a96e" }}>3. Milestone Stats & Impact</h3>
                </div>
                <button
                  type="button"
                  onClick={addAboutStat}
                  style={{ background: "#0a0a0a", color: "#fafaf8", padding: "6px 14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", border: "none", cursor: "pointer" }}
                >
                  + Add Stat
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {aboutStatsList.map((stat, idx) => (
                  <div key={idx} style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.1)", padding: "16px", position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => removeAboutStat(idx)}
                      style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "12px" }}
                    >
                      ✕
                    </button>
                    <label style={{ ...labelStyle, fontSize: "9px" }}>Number / Metric</label>
                    <input
                      value={stat.num}
                      onChange={e => updateAboutStat(idx, "num", e.target.value)}
                      placeholder="e.g. 5+"
                      style={{ ...inputStyle, marginBottom: "8px", fontWeight: "bold" }}
                    />
                    <label style={{ ...labelStyle, fontSize: "9px" }}>Stat Label</label>
                    <input
                      value={stat.label}
                      onChange={e => updateAboutStat(idx, "label", e.target.value)}
                      placeholder="e.g. Years of Craft"
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", margin: 0, color: "#c9a96e" }}>4. Brand Values & Pillars</h3>
                  <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Core principles showcased at the bottom of the About page.</p>
                </div>
                <button
                  type="button"
                  onClick={addAboutValue}
                  style={{ background: "#0a0a0a", color: "#fafaf8", padding: "6px 14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", border: "none", cursor: "pointer" }}
                >
                  + Add Value
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Values Section Tag</label>
                  <input name="about_values_label" value={settings.about_values_label} onChange={handleChange} style={inputStyle} placeholder="What We Stand For" />
                </div>
                <div>
                  <label style={labelStyle}>Values Section Title</label>
                  <input name="about_values_title" value={settings.about_values_title} onChange={handleChange} style={inputStyle} placeholder="Our Values" />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {aboutValuesList.map((val, idx) => (
                  <div key={idx} style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.1)", padding: "16px", display: "grid", gridTemplateColumns: "200px 1fr auto", gap: "16px", alignItems: "center" }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "9px" }}>Pillar Name</label>
                      <input
                        value={val.title}
                        onChange={e => updateAboutValue(idx, "title", e.target.value)}
                        placeholder="e.g. Quality"
                        style={{ ...inputStyle, marginBottom: 0, fontWeight: 600 }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "9px" }}>Pillar Description</label>
                      <input
                        value={val.desc}
                        onChange={e => updateAboutValue(idx, "desc", e.target.value)}
                        placeholder="e.g. Every stitch, every seam is held to the highest standard..."
                        style={{ ...inputStyle, marginBottom: 0 }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAboutValue(idx)}
                      style={{ background: "rgba(192,57,43,0.1)", color: "#c0392b", border: "none", padding: "10px 14px", cursor: "pointer", fontSize: "12px" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT PAGE (/contact) */}
        {activeTab === "contact" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "0 0 4px", fontWeight: 400 }}>Contact Page (/contact)</h2>
                <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Customize contact details, concierge email, telephone, address, and client hours.</p>
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: "16px", color: "#c9a96e" }}>1. Header Banner</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Header Tagline</label>
                <input name="contact_hero_tag" value={settings.contact_hero_tag} onChange={handleChange} style={inputStyle} placeholder="Get In Touch" />
              </div>
              <div>
                <label style={labelStyle}>Main Title (First Part)</label>
                <input name="contact_hero_title" value={settings.contact_hero_title} onChange={handleChange} style={inputStyle} placeholder="We'd love to" />
              </div>
              <div>
                <label style={labelStyle}>Main Title (Italic Accent)</label>
                <input name="contact_hero_subtitle" value={settings.contact_hero_subtitle} onChange={handleChange} style={inputStyle} placeholder="hear from you" />
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginTop: "20px", marginBottom: "16px", color: "#c9a96e" }}>2. Contact Information Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Section Tagline</label>
                <input name="contact_info_tag" value={settings.contact_info_tag} onChange={handleChange} style={inputStyle} placeholder="Contact Information" />
              </div>
              <div>
                <label style={labelStyle}>Section Headline</label>
                <input name="contact_info_title" value={settings.contact_info_title} onChange={handleChange} style={inputStyle} placeholder="Let's start a" />
              </div>
            </div>

            <label style={labelStyle}>Introductory Description</label>
            <textarea name="contact_info_desc" value={settings.contact_info_desc} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "8px" }}>
              <div>
                <label style={labelStyle}>Concierge Email Address</label>
                <input name="contact_email" value={settings.contact_email} onChange={handleChange} style={inputStyle} placeholder="hello@aviarbd.com" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number / WhatsApp</label>
                <input name="contact_phone" value={settings.contact_phone} onChange={handleChange} style={inputStyle} placeholder="+880 1700 000000" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Atelier / Flagship Address</label>
                <input name="contact_address" value={settings.contact_address} onChange={handleChange} style={inputStyle} placeholder="Dhaka, Bangladesh" />
              </div>
              <div>
                <label style={labelStyle}>Client Service Hours</label>
                <input name="contact_hours" value={settings.contact_hours} onChange={handleChange} style={inputStyle} placeholder="Mon–Fri, 9am–6pm BST" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FOOTER & SOCIALS */}
        {activeTab === "footer" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "0 0 4px", fontWeight: 400 }}>Footer & Global Social Links</h2>
                <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Configure brand footer tagline, copyright text, and social channel links.</p>
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: "16px", color: "#c9a96e" }}>1. Brand Tagline & Copyright</h3>
            <label style={labelStyle}>Footer Brand Tagline</label>
            <input name="footer_tagline" value={settings.footer_tagline} onChange={handleChange} style={inputStyle} placeholder="Timeless design, exceptional craft. Luxury that respects the planet." />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Copyright Line Text</label>
                <input name="footer_copyright" value={settings.footer_copyright} onChange={handleChange} style={inputStyle} placeholder="AVIAR. All rights reserved to mystrixit.site" />
              </div>
              <div>
                <label style={labelStyle}>Credits / Subtext</label>
                <input name="footer_subtext" value={settings.footer_subtext} onChange={handleChange} style={inputStyle} placeholder="Crafted by Samrise Digital" />
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginTop: "20px", marginBottom: "16px", color: "#c9a96e" }}>2. Social Media URLs</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Instagram Profile URL</label>
                <input name="footer_instagram" value={settings.footer_instagram} onChange={handleChange} style={inputStyle} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label style={labelStyle}>Pinterest URL</label>
                <input name="footer_pinterest" value={settings.footer_pinterest} onChange={handleChange} style={inputStyle} placeholder="https://pinterest.com/..." />
              </div>
              <div>
                <label style={labelStyle}>TikTok Profile URL</label>
                <input name="footer_tiktok" value={settings.footer_tiktok} onChange={handleChange} style={inputStyle} placeholder="https://tiktok.com/@..." />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Facebook Page URL (Optional)</label>
                <input name="footer_facebook" value={settings.footer_facebook} onChange={handleChange} style={inputStyle} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label style={labelStyle}>Twitter / X Profile URL (Optional)</label>
                <input name="footer_twitter" value={settings.footer_twitter} onChange={handleChange} style={inputStyle} placeholder="https://x.com/..." />
              </div>
            </div>

            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginTop: "20px", marginBottom: "16px", color: "#c9a96e" }}>3. Footer Newsletter Callout</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Teaser Header</label>
                <input name="footer_newsletter_title" value={settings.footer_newsletter_title} onChange={handleChange} style={inputStyle} placeholder="Stay in the loop" />
              </div>
              <div>
                <label style={labelStyle}>Teaser Link CTA</label>
                <input name="footer_newsletter_btn" value={settings.footer_newsletter_btn} onChange={handleChange} style={inputStyle} placeholder="Join our newsletter →" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BRAND STORY (HOMEPAGE) */}
        {activeTab === "brand" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "0 0 4px", fontWeight: 400 }}>Homepage Brand Story</h2>
                <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Configure the homepage narrative, craft statistics, and feature visual.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Section Tagline</label>
                <input name="brand_top_label" value={settings.brand_top_label} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Headline Title</label>
                <input name="brand_title" value={settings.brand_title} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            
            <label style={labelStyle}>Paragraph 1 (Primary Message)</label>
            <textarea name="brand_p1" value={settings.brand_p1} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            
            <label style={labelStyle}>Paragraph 2 (Secondary Message)</label>
            <textarea name="brand_p2" value={settings.brand_p2} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            
            <div style={{ marginTop: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <span style={labelStyle}>Brand Proof Points & Statistics</span>
                  <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Highlighted milestones shown on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={addBrandStat}
                  style={{ background: "#0a0a0a", color: "#fafaf8", padding: "6px 14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", border: "none", cursor: "pointer" }}
                >
                  + Add Stat
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {brandStatsList.map((stat, idx) => (
                  <div key={idx} style={{ background: "#fafaf8", border: "1px solid rgba(0,0,0,0.1)", padding: "16px", position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => removeBrandStat(idx)}
                      style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "12px" }}
                    >
                      ✕
                    </button>
                    <label style={{ ...labelStyle, fontSize: "9px" }}>Metric / Number</label>
                    <input
                      value={stat.num}
                      onChange={e => updateBrandStat(idx, "num", e.target.value)}
                      placeholder="e.g. 100%"
                      style={{ ...inputStyle, marginBottom: "8px", fontWeight: "bold" }}
                    />
                    <label style={{ ...labelStyle, fontSize: "9px" }}>Label / Description</label>
                    <input
                      value={stat.label}
                      onChange={e => updateBrandStat(idx, "label", e.target.value)}
                      placeholder="e.g. Premium Materials"
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <label style={labelStyle}>Brand Story Image (Editorial Visual)</label>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", flexWrap: "wrap", marginTop: "8px" }}>
              {settings.brand_image ? (
                <div style={{ position: "relative", width: 180, height: 220, background: "#f5f2ec", border: "1px solid rgba(0,0,0,0.1)", overflow: "hidden" }}>
                  <Image src={settings.brand_image} alt="Brand Visual" fill style={{ objectFit: "cover" }} unoptimized />
                  <button
                    type="button"
                    onClick={() => setSettings(p => ({ ...p, brand_image: "" }))}
                    style={{ position: "absolute", top: 8, right: 8, background: "#c0392b", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: "12px" }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ width: 180, height: 220, border: "1px dashed rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#8a8680" }}>
                  No Image (Default Fallback)
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], "brand_image")}
                  style={{ display: "none" }}
                  id="brand_image_upload"
                />
                <label
                  htmlFor="brand_image_upload"
                  style={{
                    background: "#0a0a0a",
                    color: "#fafaf8",
                    padding: "10px 20px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    display: "inline-block",
                    opacity: uploadingState.brand_image ? 0.6 : 1
                  }}
                >
                  {uploadingState.brand_image ? "Uploading..." : settings.brand_image ? "Replace Image" : "Upload Image"}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MARQUEE */}
        {activeTab === "marquee" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "0 0 4px", fontWeight: 400 }}>Scrolling Marquee Announcements</h2>
                <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Live ticker messages displayed below the hero header.</p>
              </div>
              <button
                type="button"
                onClick={addMarqueePhrase}
                style={{ background: "#0a0a0a", color: "#fafaf8", padding: "6px 14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", border: "none", cursor: "pointer" }}
              >
                + Add Phrase
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {marqueeList.map((phrase, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#8a8680", width: "24px" }}>#{idx + 1}</span>
                  <input
                    value={phrase}
                    onChange={e => updateMarqueePhrase(idx, e.target.value)}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeMarqueePhrase(idx)}
                    style={{ background: "rgba(192,57,43,0.1)", color: "#c0392b", border: "none", padding: "12px 14px", cursor: "pointer", fontSize: "12px" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: IDENTITY & LOGO */}
        {activeTab === "identity" && (
          <div style={sectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "0 0 4px", fontWeight: 400 }}>Brand Identity & Logo</h2>
                <p style={{ fontSize: "12px", color: "#8a8680", margin: 0 }}>Upload your luxury brand logo displayed across navigation and footer.</p>
              </div>
            </div>
            
            <label style={labelStyle}>Site Logo (Dark / Transparent PNG Recommended)</label>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
              {settings.site_logo ? (
                <div style={{ position: "relative", width: 160, height: 70, background: "#f5f2ec", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                  <Image src={settings.site_logo} alt="Logo Preview" width={140} height={50} style={{ objectFit: "contain", maxHeight: "100%" }} unoptimized />
                  <button
                    type="button"
                    onClick={() => setSettings(p => ({ ...p, site_logo: "" }))}
                    style={{ position: "absolute", top: -8, right: -8, background: "#c0392b", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: "12px" }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ width: 160, height: 70, border: "1px dashed rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#8a8680" }}>
                  Default Text Logo
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && handleSingleImageUpload(e.target.files[0], "site_logo")}
                  style={{ display: "none" }}
                  id="site_logo_upload"
                />
                <label
                  htmlFor="site_logo_upload"
                  style={{
                    background: "#0a0a0a",
                    color: "#fafaf8",
                    padding: "10px 20px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    display: "inline-block",
                    opacity: uploadingState.site_logo ? 0.6 : 1
                  }}
                >
                  {uploadingState.site_logo ? "Uploading..." : settings.site_logo ? "Replace Logo" : "Upload Logo"}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "24px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#0a0a0a",
              color: "#fafaf8",
              border: "none",
              padding: "16px 40px",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            {saving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>

      </form>

      {/* Floating Notification Toast */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`,
          background: toast.ok ? "#0a0a0a" : "#c0392b",
          color: "#fafaf8",
          padding: "14px 28px",
          fontSize: "12px",
          letterSpacing: "0.08em",
          zIndex: 9999,
          opacity: toast.show ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
        }}
      >
        {toast.ok ? "✓ " : "✕ "} {toast.message}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}

