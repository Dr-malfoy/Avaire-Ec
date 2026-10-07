// components/Marquee.tsx
"use client";

import { Fragment, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Marquee() {
  const [phrases, setPhrases] = useState([
    "Free shipping on orders over ৳150",
    "New Arrivals Every Monday",
    "Ethically Sourced Materials",
    "30-Day Returns, No Questions",
    "Crafted by Artisans",
  ]);

  useEffect(() => {
    fetch("/api/settings").then(res => res.json()).then(data => {
      if (data.marquee_phrases) {
        try {
          const parsed = JSON.parse(data.marquee_phrases);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPhrases(parsed);
          }
        } catch (e) {}
      }
    }).catch(console.error);
  }, []);
  return (
    <div
      className="w-full overflow-hidden bg-[#0a0a0a] py-[14px] md:py-[20px]"
      style={{
        borderTop: "0.5px solid rgba(201,169,110,0.2)",
        borderBottom: "0.5px solid rgba(201,169,110,0.2)",
      }}
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center gap-[60px] pr-[60px]">
            {phrases.map((phrase, j) => (
              <Fragment key={j}>
                <span className="text-[11px] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.4)] whitespace-nowrap">
                  {phrase}
                </span>
                <span className="text-[#c9a96e] whitespace-nowrap">✦</span>
              </Fragment>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
