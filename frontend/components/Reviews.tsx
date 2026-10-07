// components/Reviews.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: number;
  rating: number;
  text: string;
  name: string;
  subtitle: string;
  location: string;
  initials: string;
  product: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    rating: 5,
    text: "The silk wrap blouse exceeded all my expectations. The drape is immaculate and the attention to detail in the hand-finished stitching is nothing short of haute couture.",
    name: "Eleanor Vance",
    subtitle: "Verified Collector",
    location: "London, UK",
    initials: "EV",
    product: "Silk Wrap Blouse"
  },
  {
    id: 2,
    rating: 5,
    text: "AVIAR has completely transformed my wardrobe. These aren't just seasonal garments; they are investment pieces that feel as sublime as they look.",
    name: "Sophia Laurent",
    subtitle: "Fashion Director",
    location: "Paris, France",
    initials: "SL",
    product: "Cashmere Turtleneck"
  },
  {
    id: 3,
    rating: 5,
    text: "Finding a fashion house that genuinely balances modern minimalism with ethical artisan craftsmanship is rare. The tailored trousers fit like a dream.",
    name: "Clara Hughes",
    subtitle: "Verified Collector",
    location: "New York, USA",
    initials: "CH",
    product: "Tailored Trousers"
  },
  {
    id: 4,
    rating: 5,
    text: "The full-grain leather tote arrived in breathtaking bespoke packaging. The leather aroma, weight, and gold-tone hardware are pure perfection.",
    name: "Marcus Sterling",
    subtitle: "Verified Collector",
    location: "Milan, Italy",
    initials: "MS",
    product: "Leather Crossbody"
  },
  {
    id: 5,
    rating: 5,
    text: "Exceptional service from their personal styling concierge. The cashmere wrap is featherlight yet incredibly warm. An essential staple.",
    name: "Genevieve Dubois",
    subtitle: "Art Director",
    location: "Geneva, Switzerland",
    initials: "GD",
    product: "Cashmere Wrap"
  },
  {
    id: 6,
    rating: 5,
    text: "Every stitch speaks to the brand's uncompromising dedication to luxury. Wearing AVIAR brings an understated confidence that turns heads.",
    name: "Aurelia Thorne",
    subtitle: "Verified Collector",
    location: "Tokyo, Japan",
    initials: "AT",
    product: "Linen Blazer"
  }
];

export default function Reviews() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(REVIEWS.length / itemsPerPage);

  const displayedReviews = REVIEWS.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const nextPage = () => setPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <section
      style={{
        background: "#faf8f5",
        padding: "110px 24px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Subtle Background Accent */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(201, 169, 110, 0.04) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Header Block */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}
          >
            <span style={{ color: "#c9a96e", fontSize: "10px" }}>✦</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#8a8680", fontWeight: 600 }}>
              Client Testimonials & Critique
            </span>
            <span style={{ color: "#c9a96e", fontSize: "10px" }}>✦</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(38px, 5vw, 60px)",
              fontWeight: 300,
              color: "#0a0a0a",
              lineHeight: 1.1,
              marginBottom: "16px"
            }}
          >
            Loved by <em style={{ color: "#c9a96e", fontStyle: "italic" }}>Thousands</em>
          </motion.h2>

          {/* Rating Summary Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background: "#ffffff",
              padding: "8px 20px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ color: "#c9a96e", letterSpacing: "2px", fontSize: "14px" }}>★★★★★</div>
            <div style={{ width: "1px", height: "14px", background: "rgba(0,0,0,0.15)" }} />
            <span style={{ fontSize: "12px", color: "#0a0a0a", fontWeight: 600 }}>4.95 / 5.0</span>
            <span style={{ fontSize: "12px", color: "#8a8680" }}>from 2,400+ Verified Reviews</span>
          </motion.div>
        </div>

        {/* Reviews Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
              marginBottom: "48px"
            }}
          >
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  padding: "36px 32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "320px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  position: "relative",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "default"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
                }}
              >
                {/* Top: Stars & Product Badge */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ color: "#c9a96e", letterSpacing: "2px", fontSize: "14px" }}>
                      {"★".repeat(review.rating)}
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#16a34a",
                        background: "rgba(22,163,74,0.08)",
                        padding: "3px 8px",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>✓</span> Verified Buyer
                    </span>
                  </div>

                  {/* Review Quote Text */}
                  <p
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "19px",
                      lineHeight: "1.65",
                      color: "#1a1918",
                      fontStyle: "italic",
                      marginBottom: "28px"
                    }}
                  >
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Bottom: Author & Purchased Item */}
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#0a0a0a",
                          color: "#c9a96e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Cormorant Garamond, serif",
                          fontSize: "15px",
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        {review.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#0a0a0a", marginBottom: "2px" }}>
                          {review.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#8a8680" }}>
                          {review.subtitle} · {review.location}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#8a8680",
                        background: "#f5f3ee",
                        padding: "4px 8px",
                        borderRadius: 2,
                        textAlign: "right"
                      }}
                    >
                      {review.product}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Pagination & Arrows */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          
          {/* Trust Highlights */}
          <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#8a8680" }}>
              <span style={{ color: "#c9a96e" }}>✦</span> 99.4% Drape & Fit Satisfaction
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#8a8680" }}>
              <span style={{ color: "#c9a96e" }}>✦</span> Complimentary Global Returns
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  style={{
                    width: idx === page ? "24px" : "8px",
                    height: "6px",
                    borderRadius: "3px",
                    background: idx === page ? "#c9a96e" : "rgba(0,0,0,0.15)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0
                  }}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={prevPage}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#ffffff",
                  color: "#0a0a0a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0a0a0a";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "#0a0a0a";
                }}
                aria-label="Previous reviews"
              >
                ←
              </button>
              <button
                onClick={nextPage}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#ffffff",
                  color: "#0a0a0a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#0a0a0a";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "#0a0a0a";
                }}
                aria-label="Next reviews"
              >
                →
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}