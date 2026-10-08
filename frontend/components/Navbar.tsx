// components/Navbar.tsx
"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import SearchModal from "@/components/SearchModal";
import { AnimatePresence, motion } from "framer-motion";

// Extra entries shown only in the mobile drawer
const DRAWER_EXTRAS = [
  { name: "Track Order", href: "/track" },
  { name: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [siteLogo, setSiteLogo] = useState("");

  const [announcementHeight, setAnnouncementHeight] = useState(0);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    const update = (forcedH?: number) => {
      let h = forcedH;
      if (h === undefined) {
        const el = document.getElementById("aviar-announcement-bar");
        h = el ? el.offsetHeight : 0;
      }
      setAnnouncementHeight(h);
      const sy = window.scrollY;
      setIsScrolled(sy > 80);
      setTopOffset(Math.max(0, h - sy));
    };

    update();

    const handleHeightChange = (e: any) => {
      update(typeof e?.detail === "number" ? e.detail : 0);
    };

    window.addEventListener("announcement-height-change", handleHeightChange);
    return () => window.removeEventListener("announcement-height-change", handleHeightChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      setIsScrolled(sy > 80);
      setTopOffset(Math.max(0, announcementHeight - sy));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [announcementHeight]);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [navLinks, setNavLinks] = useState([
    { name: "Home", href: "/" },
    { name: "Collections", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]);

  useEffect(() => {
    fetch("/api/sections")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Skip sections that would duplicate a fixed link (e.g. the default
          // "Collection" section next to "Collections"), and repeated labels.
          const norm = (s: string) => String(s ?? "").trim().toLowerCase().replace(/s$/, "");
          const taken = new Set(["home", "collection", "about", "contact"]);
          const dynamicLinks = data
            .filter((sec: any) => {
              const key = norm(sec.label);
              if (!key || taken.has(key) || norm(sec.id) === "collection") return false;
              taken.add(key);
              return true;
            })
            .map((sec: any) => ({
              name: sec.label,
              href: `/shop?filter=${sec.id}`
            }));
          setNavLinks([
            { name: "Home", href: "/" },
            { name: "Collections", href: "/shop" },
            ...dynamicLinks,
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" }
          ]);
        }
      })
      .catch(console.error);

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.site_logo) setSiteLogo(data.site_logo);
      })
      .catch(console.error);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const textColor = isScrolled ? "#0a0a0a" : "#fafaf8";
  const bgStyle = isScrolled
    ? { background: "rgba(250,250,248,0.95)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }
    : { background: "transparent" };

  return (
    <>
      <nav
        style={{ position: "fixed", top: `${topOffset}px`, left: 0, width: "100%", height: "64px", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.4s ease, border-color 0.4s ease, filter 0.4s ease", padding: "0 24px", ...bgStyle }}
        className="md:px-12"
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", width: "96px", height: "28px" }} className="md:w-[120px] md:h-[32px]">
            <Image
              src={siteLogo || "/lg.png"}
              alt="AVIAR Logo"
              fill
              style={{ objectFit: "contain", transition: "filter 0.4s ease", filter: isScrolled ? (siteLogo ? "none" : "brightness(0)") : (siteLogo ? "brightness(0) invert(1)" : "brightness(0) invert(1)") }}
              unoptimized
            />
          </div>
          <div style={{ fontSize: "7px", letterSpacing: "0.3em", textTransform: "uppercase", color: isScrolled ? "#c9a96e" : "rgba(201,169,110,0.9)", transition: "color 0.4s", marginTop: "2px" }}>
            Premium Collection
          </div>
        </Link>

        {/* Desktop Nav Links — centered between logo and icons */}
        {isDesktop && (
          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                style={{ textDecoration: "none", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: textColor, transition: "color 0.3s", fontFamily: "DM Sans, sans-serif" }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Icons */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Search */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ background: "none", border: "none", cursor: "pointer", color: textColor, transition: "color 0.4s" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Wishlist — desktop only */}
          {isDesktop && (
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              style={{ color: textColor, transition: "color 0.4s", minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {mounted && wishlistCount > 0 && (
                <span style={{ position: "absolute", top: "2px", right: "2px", background: "#c0392b", color: "white", fontSize: "9px", fontWeight: 600, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart */}
          <button
            aria-label="Cart"
            onClick={() => router.push("/cart")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center relative"
            style={{ background: "none", border: "none", cursor: "pointer", color: textColor, transition: "color 0.4s" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {mounted && cartCount > 0 && (
              <span style={{ position: "absolute", top: "2px", right: "2px", background: "#c9a96e", color: "#0a0a0a", fontSize: "9px", fontWeight: 600, width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — opens menu drawer on all screen sizes */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", color: textColor, minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 110,
              }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                position: "fixed", top: 0, right: 0,
                height: "100%", width: "280px", maxWidth: "85vw",
                background: "#0a0a0a",
                zIndex: 115,
                display: "flex", flexDirection: "column",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
              }}
            >
              {/* Drawer header — height matches navbar so the close X aligns with where the hamburger was */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 16px 0 24px",
                height: 64,
                borderBottom: "0.5px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  style={{
                    minWidth: "44px", minHeight: "44px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav style={{
                flex: 1, padding: "20px 24px",
                display: "flex", flexDirection: "column", gap: "4px",
                overflowY: "auto",
              }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block", padding: "14px 0",
                      fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.75)",
                      textDecoration: "none",
                      borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                      fontFamily: "DM Sans, sans-serif",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Account section divider */}
                <div style={{
                  fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
                  color: "#c9a96e", marginTop: 24, marginBottom: 4,
                }}>
                  Your Account
                </div>
                {DRAWER_EXTRAS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block", padding: "14px 0",
                      fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "rgba(255,255,255,0.75)",
                      textDecoration: "none",
                      borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                      fontFamily: "DM Sans, sans-serif",
                      transition: "color 0.2s",
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Drawer footer */}
              <div style={{
                padding: "20px 24px",
                borderTop: "0.5px solid rgba(255,255,255,0.1)",
                display: "flex", gap: "16px", alignItems: "center",
              }}>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Wishlist {mounted && wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
