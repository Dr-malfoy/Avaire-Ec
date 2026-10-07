"use client";
import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
const BackToTop = dynamic(() => import("@/components/BackToTop"), { ssr: false });
const ExitPopup = dynamic(() => import("@/components/ExitPopup"), { ssr: false });
const LiveChat = dynamic(() => import("@/components/LiveChat"), { ssr: false });

export default function ClientOnlyComponents() {
  return (
    <>
      <CustomCursor />
      <BackToTop />
      <ExitPopup />
      <LiveChat />
    </>
  );
}
