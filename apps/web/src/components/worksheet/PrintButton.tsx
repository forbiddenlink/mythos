"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Opens the browser print dialog; hidden on the printed page itself. */
export function PrintButton({ label = "Print worksheet" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="gold"
      onClick={() => globalThis.print()}
      className="print:hidden"
    >
      <Printer aria-hidden="true" className="size-4" />
      {label}
    </Button>
  );
}
