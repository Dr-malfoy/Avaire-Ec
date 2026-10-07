import Link from "next/link";

/** Shown when a product link points to something that no longer exists. */
export default function ProductNotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "#fafaf8", textAlign: "center" }}>
      <div>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 12 }}>Not available</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 300, marginBottom: 12 }}>
          Product <em>not found</em>
        </h1>
        <p style={{ fontSize: "14px", color: "#8a8680", marginBottom: 28 }}>This product may have been removed or the link is incorrect.</p>
        <Link href="/shop" style={{ display: "inline-block", background: "#0a0a0a", color: "#fafaf8", padding: "14px 28px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
