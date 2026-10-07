// app/shop/page.tsx
import Navbar from "@/components/Navbar";
import Products from "@/components/Products";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Shop — AVIAR Premium Collection",
  description: "Browse our curated selection of luxury clothing and accessories.",
};

export default async function ShopPage(props: { searchParams: Promise<{ filter?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <PageTransition>
      <main>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />
        <div className="bg-cream px-4 md:px-12 pt-10">
          <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(32px,4vw,56px)", fontWeight: 300, color: "#0a0a0a", marginBottom: "8px" }}>
              The <em>Collection</em>
            </h1>
            <p style={{ fontSize: "13px", color: "#8a8680", marginBottom: "0", paddingBottom: "32px" }}>
              Curated luxury pieces crafted with intention
            </p>
          </div>
        </div>
        <Products shopMode initialFilter={searchParams?.filter} />
        <Footer />
      </main>
    </PageTransition>
  );
}
