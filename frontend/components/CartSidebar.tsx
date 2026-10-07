// components/CartSidebar.tsx
"use client";


import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartSidebar() {
  const router = useRouter();
  const {
    isCartOpen,
    closeCart,
    cart,
    removeItem,
    changeQty,
    cartTotal,
    addToCart,
  } = useCart();

  const handleAddUpsell = () => {
    addToCart({
      id: "upsell-1",
      name: "Signature Cashmere Scarf",
      price: 150,
      image: "🧣",
      category: "Accessories",
      size: "OS",
      color: "Default",
      qty: 1,
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            onClick={closeCart}
            className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[199]"
            aria-hidden="true"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[200] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 md:p-[32px] border-b-[0.5px] border-[rgba(0,0,0,0.08)] shrink-0">
              <h2 className="font-display text-[24px] text-black leading-none">
                Your Cart
              </h2>
              <button
                onClick={closeCart}
                className="text-[20px] text-black hover:opacity-70 transition-opacity"
                aria-label="Close Cart"
              >
                ✕
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto w-full flex flex-col">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <p className="text-muted text-[14px]">Your cart is empty</p>
                  <div className="w-[24px] h-[1px] bg-gold" />
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="relative flex items-center gap-4 md:gap-6 p-5 md:p-[24px_32px] border-b-[0.5px] border-[rgba(0,0,0,0.06)]"
                    >
                      {/* Image Placeholder */}
                      <div className="w-[72px] h-[72px] shrink-0 bg-cream flex items-center justify-center text-[28px]">
                        {item.image}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 gap-2">
                        <div className="pr-6">
                          <h3 className="font-display text-[16px] leading-tight text-black">
                            {item.name}
                          </h3>
                          <div className="text-[13px] text-gold mt-1">
                            ৳{item.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-1">
                          <button
                            onClick={() =>
                              changeQty(item.id, item.size, item.color, item.qty - 1)
                            }
                            className="text-[14px] text-muted hover:text-black w-6 h-6 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-[13px] text-black min-w-[12px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              changeQty(item.id, item.size, item.color, item.qty + 1)
                            }
                            className="text-[14px] text-muted hover:text-black w-6 h-6 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="absolute top-5 right-5 md:top-[24px] md:right-[32px] text-[12px] text-muted hover:text-black transition-colors"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Upsell Box */}
                  <div className="bg-cream p-4 md:p-[20px_32px] m-5 md:m-[32px_32px_0_32px] border-[0.5px] border-[rgba(201,169,110,0.2)]">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-gold mb-3">
                      You might also like
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] bg-white flex items-center justify-center text-[18px]">
                          🧣
                        </div>
                        <div className="font-display text-[15px] text-black">
                          Cashmere Scarf
                        </div>
                      </div>
                      <button
                        onClick={handleAddUpsell}
                        className="text-[11px] uppercase tracking-[0.1em] text-black border-b-[0.5px] border-black pb-0.5 hover:text-gold hover:border-gold transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 md:p-[32px] border-t-[0.5px] border-[rgba(0,0,0,0.08)] shrink-0 bg-white">
              <div className="flex items-end justify-between mb-6">
                <span className="text-[14px] text-muted">Subtotal</span>
                <span className="font-display text-[24px] text-black leading-none">
                  ৳{cartTotal.toFixed(2)}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { closeCart(); router.push("/checkout"); }}
                className="w-full bg-black text-white py-[16px] text-[13px] uppercase tracking-[0.12em] hover:bg-gold hover:text-black transition-colors duration-300 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
              >
                Proceed to Checkout
              </button>

              <div className="text-center text-[11px] text-muted mt-4">
                🔒 Secure checkout · Free shipping over ৳150
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
