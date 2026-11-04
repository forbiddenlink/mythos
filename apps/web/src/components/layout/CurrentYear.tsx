"use client";

import { useEffect, useState } from "react";

/**
 * The footer is prerendered, so a server-side `new Date()` freezes at build
 * time. Render the build year for a matching hydration, then correct it in
 * the browser so a deploy-free New Year does not leave last year's date.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const [year, setYear] = useState(buildYear);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <>{year}</>;
}
