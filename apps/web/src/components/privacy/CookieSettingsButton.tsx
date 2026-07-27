"use client";

import { useCallback } from "react";

/** Footer/privacy control to reopen the cookie preference banner. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const open = useCallback(() => {
    window.dispatchEvent(new Event("mythos-cookie-consent-open"));
  }, []);

  return (
    <button type="button" onClick={open} className={className}>
      Cookie Settings
    </button>
  );
}
