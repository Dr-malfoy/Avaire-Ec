// components/Footer.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/about", label: "Sustainability" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Press & Inquiries" },
];

const HELP_LINKS = [
  { href: "/track",   label: "Track Order" },
  { href: "/about",   label: "Shipping & Returns" },
  { href: "/about",   label: "Size Guide" },
  { href: "/contact", label: "Client Concierge" },
  { href: "/contact", label: "Contact Us" },
];

const linkStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "rgba(255,255,255,0.5)",
  textDecoration: "none",
  marginBottom: "14px",
  lineHeight: "1.4",
  transition: "color 0.2s",
};

const headingStyle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#c9a96e",
  marginBottom: "24px",
  fontWeight: 600
};

export default function Footer() {
  const [cols, setCols] = useState(4);
  const [siteLogo, setSiteLogo] = useState("");
  const [shopLinks, setShopLinks] = useState<{ href: string; label: string }[]>([
    { href: "/shop", label: "All Collections" },
  ]);

  const [settings, setSettings] = useState({
    footer_tagline: "Timeless design, exceptional craft. Luxury that respects the planet.",
    footer_copyright: "AVIAR. All rights reserved.",
    footer_subtext: "Crafted by Samrise Digital",
    footer_instagram: "#",
    footer_pinterest: "#",
    footer_tiktok: "#",
    footer_facebook: "",
    footer_twitter: "",
    footer_newsletter_title: "Stay in the loop",
    footer_newsletter_btn: "Join our newsletter →"
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 1 : w < 1024 ? 2 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShopLinks(
            data.map((sec: any) => ({
              href: `/shop?filter=${sec.id}`,
              label: sec.label,
            }))
          );
        }
      })
      .catch(console.error);

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.site_logo) setSiteLogo(data.site_logo);
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, []);

  const socials = [
    { label: "Instagram", icon: "IG", url: settings.footer_instagram },
    { label: "Pinterest", icon: "PT", url: settings.footer_pinterest },
    { label: "TikTok", icon: "TK", url: settings.footer_tiktok },
    ...(settings.footer_facebook ? [{ label: "Facebook", icon: "FB", url: settings.footer_facebook }] : []),
    ...(settings.footer_twitter ? [{ label: "Twitter / X", icon: "X", url: settings.footer_twitter }] : [])
  ].filter(s => Boolean(s.url));

  return (
    <footer
      style={{
        background: "#0a0a0a",
        width: "100%",
        borderTop: "1px solid rgba(201,169,110,0.15)",
        paddingTop: cols === 1 ? "48px" : "72px",
        paddingBottom: cols === 1 ? "32px" : "40px",
        paddingLeft: cols === 1 ? "20px" : "48px",
        paddingRight: cols === 1 ? "20px" : "48px",
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>

        {/* Top 4-Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: cols === 1 ? "40px" : "48px" }}>

          {/* Brand & Socials */}
          <div>
            <Link href="/" style={{ display: "block", textDecoration: "none", marginBottom: "16px" }}>
              {siteLogo ? (
                <div style={{ position: "relative", width: "120px", height: "32px" }}>
                  <Image src={siteLogo} alt="AVIAR Logo" fill style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} unoptimized />
                </div>
              ) : (
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</div>
              )}
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a96e", marginTop: "2px" }}>Premium Collection</div>
            </Link>
            
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: "240px", margin: 0 }}>
              {settings.footer_tagline}
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {socials.map(({ label, icon, url }) => (
                <a
                  key={label}
                  href={url || "#"}
                  target={url && url.startsWith("http") ? "_blank" : undefined}
                  rel={url && url.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  style={{
                    width: 36,
                    height: 36,
                    border: "0.5px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    letterSpacing: "0.05em",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c9a96e";
                    e.currentTarget.style.color = "#c9a96e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <div style={headingStyle}>Shop</div>
            {shopLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={linkStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={headingStyle}>Company</div>
            {COMPANY_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={linkStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Help & Newsletter Link */}
          <div>
            <div style={headingStyle}>Client Concierge</div>
            {HELP_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={linkStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                {l.label}
              </Link>
            ))}

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.06em" }}>
                {settings.footer_newsletter_title}
              </div>
              <Link
                href="/#newsletter"
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#c9a96e",
                  textDecoration: "none",
                  borderBottom: "0.5px solid rgba(201,169,110,0.4)",
                  paddingBottom: 2,
                }}
              >
                {settings.footer_newsletter_btn}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div
          style={{
            marginTop: "56px",
            paddingTop: "24px",
            borderTop: "0.5px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: cols === 1 ? "column" : "row",
            justifyContent: "space-between",
            alignItems: cols === 1 ? "flex-start" : "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()} {settings.footer_copyright}
          </span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <a
                key={t}
                href="#"
                style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >
                {t}
              </a>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
            {settings.footer_subtext}
          </span>
        </div>

      </div>
    </footer>
  );
}
