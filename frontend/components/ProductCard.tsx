// components/ProductCard.tsx
"use client";
import { useState, memo, type MouseEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  icon?: string;
  category: string;
  badge?: "new" | "sale";
  slug?: string;
};

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

const ProductCard = memo(function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, "-");

  const handleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      slug,
      icon: product.icon || "🛍️",
    });
  };

  return (
    <>
      <style>{`
        @keyframes flowGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3/4",
          borderRadius: "24px",
          overflow: "hidden",
          cursor: "pointer",
          boxShadow: isHovered 
            ? "0 30px 60px rgba(0,0,0,0.15), 0 0 40px rgba(252, 182, 159, 0.4)" 
            : "0 10px 30px rgba(0,0,0,0.05)",
          transform: isHovered ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)",
          transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* Animated Dynamic Gradient Background */}
        <div style={{
          position: "absolute",
          inset: "-50%",
          background: "linear-gradient(45deg, #ff9a9e 0%, #fecfef 25%, #f6d365 50%, #fda085 75%, #ff9a9e 100%)",
          backgroundSize: "400% 400%",
          animation: isHovered ? "flowGradient 3s ease infinite" : "flowGradient 10s ease infinite",
          zIndex: 0,
          opacity: isHovered ? 1 : 0.4,
          transition: "opacity 0.5s ease",
        }} />

        {/* Inner shadow/border for 3D look */}
        <div style={{
          position: "absolute",
          inset: 0,
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: "24px",
          zIndex: 5,
          pointerEvents: "none",
        }} />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 30,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: inWishlist ? "#c0392b" : "rgba(255,255,255,0.3)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: inWishlist ? "white" : "#1a1a1a",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {inWishlist ? "♥" : "♡"}
        </button>

        {/* Badge */}
        {product.badge && (
          <div style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 30,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            color: "white",
            padding: "6px 14px",
            borderRadius: "100px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {product.badge}
          </div>
        )}

        {/* Product Image / Icon */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "0",
          right: "0",
          bottom: "35%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          transform: isHovered ? "scale(1.15) translateY(-5%)" : "scale(1) translateY(0)",
        }}>
          {product.image ? (
            <Image src={product.image} alt={product.name} fill style={{ objectFit: "contain", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.2))" }} />
          ) : (
            <div style={{ fontSize: "72px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.2))" }}>
              {product.icon}
            </div>
          )}
        </div>

        {/* Glassmorphic Bottom Panel */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.6)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 20,
          transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          transform: isHovered ? "translateY(0)" : "translateY(56px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5a5a", fontFamily: "DM Sans, sans-serif", marginBottom: "6px" }}>
                {product.category}
              </div>
              <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.1 }}>
                {product.name}
              </h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", fontFamily: "DM Sans, sans-serif" }}>
                ৳{product.price}
              </div>
              {product.originalPrice && (
                <div style={{ fontSize: "12px", textDecoration: "line-through", color: "#8a8680", fontFamily: "DM Sans, sans-serif" }}>
                  ৳{product.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "12px", display: "flex", gap: "8px", opacity: isHovered ? 1 : 0, transition: "opacity 0.3s" }}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
              style={{
                flex: 1,
                background: "linear-gradient(90deg, #0a0a0a 0%, #2a2a2a 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "13px 8px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Add to Bag
            </button>
            <Link
              href={`/buy/${slug}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                background: "linear-gradient(90deg, #c9a96e 0%, #b8924a 100%)",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "12px",
                padding: "13px 8px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 8px 16px rgba(201,169,110,0.4)",
                transition: "transform 0.2s",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                position: "relative",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Buy Now
            </Link>
          </div>
        </div>

        {/* Invisible Link */}
        <Link href={`/product/${slug}`} style={{ position: "absolute", inset: 0, zIndex: 15 }} aria-label={`View ${product.name}`} />
      </motion.div>
    </>
  );
});

export default ProductCard;

