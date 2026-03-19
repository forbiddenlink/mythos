"use client";

import dynamic from "next/dynamic";

// Dynamic import for custom cursor (client-only, no SSR)
const CustomCursor = dynamic(
  () =>
    import("@/components/effects/CustomCursor").then((mod) => mod.CustomCursor),
  { ssr: false },
);

// Dynamic import for AI Oracle chat
const OracleChat = dynamic(
  () => import("@/components/oracle/OracleChat").then((mod) => mod.OracleChat),
  { ssr: false },
);

// Keep Oracle on by default outside production. In production, require an
// explicit public opt-in so the UI doesn't expose a broken feature when the
// backend key hasn't been configured.
const oracleEnabled =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_ORACLE_ENABLED === "true";

/**
 * Client-side layout effects wrapper
 * Contains visual effects that should be rendered across all pages
 */
export function LayoutEffects() {
  return (
    <>
      <CustomCursor />
      {oracleEnabled && <OracleChat />}
    </>
  );
}

export default LayoutEffects;
