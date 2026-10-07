"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import PageTransition from "@/components/PageTransition";
import Breadcrumb from "@/components/Breadcrumb";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 2 : w < 1024 ? 3 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleAddToCart = (item: typeof wishlist[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.icon,
      category: item.category,
      size: "OS",
      color: "Default",
      qty: 1,
    });
    openCart();
    removeFromWishlist(item.id);
  };

  return (
    <PageTransition>
      <main>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />

        <section style={{ background: "#fafaf8", minHeight: "80vh", padding: cols >= 4 ? "80px 48px" : "48px 20px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "12px" }}>Your</div>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(36px,4vw,64px)", fontWeight: 300, color: "#0a0a0a" }}>
                Wishlist <em>({wishlist.length})</em>
              </h1>
            </div>

            {wishlist.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "24px" }}>♡</div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 300, marginBottom: "16px" }}>Your wishlist is empty</div>
                <p style={{ fontSize: "14px", color: "#8a8680", marginBottom: "32px" }}>Save items you love and come back to them later.</p>
                <Link href="/shop" style={{ textDecoration: "none", background: "#0a0a0a", color: "#fafaf8", padding: "14px 40px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", display: "inline-block" }}>
                  Browse Collection
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: cols <= 2 ? "12px" : "16px" }}>
                {wishlist.map((item) => (
                  <div key={item.id} style={{ background: "white", position: "relative" }}>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#8a8680", zIndex: 10 }}
                    >
                      ✕
                    </button>
                    <Link href={`/product/${item.slug}`} style={{ textDecoration: "none" }}>
                      <div style={{ aspectRatio: "3/4", background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "64px" }}>
                        {item.icon}
                      </div>
                    </Link>
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "4px" }}>{item.category}</div>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "17px", color: "#0a0a0a", marginBottom: "4px" }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        {item.originalPrice && (
                          <span style={{ fontSize: "12px", color: "#8a8680", textDecoration: "line-through" }}>৳{item.originalPrice}</span>
                        )}
                        <span style={{ fontSize: "13px", color: "#0a0a0a" }}>৳{item.price}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        style={{ width: "100%", background: "#0a0a0a", color: "#fafaf8", border: "none", padding: "12px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
