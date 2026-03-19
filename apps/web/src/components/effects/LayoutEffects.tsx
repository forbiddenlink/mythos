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

// Keep Oracle on by default for local dev and E2E tests.
// Set NEXT_PUBLIC_ORACLE_ENABLED="false" to explicitly disable it.
const oracleEnabled = process.env.NEXT_PUBLIC_ORACLE_ENABLED !== "false";

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
