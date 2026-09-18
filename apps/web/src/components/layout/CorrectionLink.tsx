"use client";

import { usePathname } from "next/navigation";

export function CorrectionLink() {
  const pathname = usePathname();
  const query = new URLSearchParams({
    title: `Content correction: ${pathname}`,
    body: `Page: https://mythosatlas.com${pathname}\n\nSection or statement:\n\nSuggested correction:\n\nSupporting work, passage, or reference URL:\n\nPlease omit personal or sensitive information. This issue will be public.`,
  });

  return (
    <a
      href={`https://github.com/forbiddenlink/mythos/issues/new?${query}`}
      className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      Suggest a correction (GitHub)
    </a>
  );
}
