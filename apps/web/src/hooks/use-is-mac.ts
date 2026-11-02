"use client";

import { useEffect, useState } from "react";

/** Apple platform check for shortcut hints. `null` until mounted, to match SSR. */
export function useIsMac(): boolean | null {
  const [isMac, setIsMac] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
  }, []);

  return isMac;
}
