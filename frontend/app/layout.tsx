// app/layout.tsx
import type { Metadata } from "next";
import { type ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartSidebarWrapper from "@/components/CartSidebarWrapper";
import AnnouncementBar from "@/components/AnnouncementBar";
import ClientOnlyComponents from "@/components/ClientOnlyComponents";
import StoreOnly from "@/components/StoreOnly";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVIAR — Premium Collection",
  description: "Luxury clothing and lifestyle brand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreOnly>
          <ClientOnlyComponents />
          <AnnouncementBar />
        </StoreOnly>
        <CartProvider>
          <WishlistProvider>
            {children}
            <StoreOnly>
              <CartSidebarWrapper />
            </StoreOnly>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
