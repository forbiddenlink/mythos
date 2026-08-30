"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeityExportData, StoryExportData } from "@/lib/pdf-export";

interface DeityExportButtonProps {
  type: "deity";
  data: DeityExportData;
  variant?: "default" | "outline" | "ghost" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

interface StoryExportButtonProps {
  type: "story";
  data: StoryExportData;
  variant?: "default" | "outline" | "ghost" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

type ExportButtonProps = DeityExportButtonProps | StoryExportButtonProps;

/**
 * Shared export handler for both button variants, so the dynamic-import and
 * error-handling behaviour cannot drift between them.
 */
function useExportPdf(
  type: "deity" | "story",
  data: DeityExportData | StoryExportData,
) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // Dynamic import keeps jsPDF (+ unicode-font-resolver) out of the initial
      // bundle — it fetches cdn.jsdelivr.net on first click, not on page load.
      const { exportDeityToPdf, exportStoryToPdf } =
        await import("@/lib/pdf-export");
      if (type === "deity") {
        await exportDeityToPdf(data as DeityExportData);
      } else {
        await exportStoryToPdf(data as StoryExportData);
      }
    } catch (error) {
      console.error("Failed to export PDF:", error);
      // No toast system in this app, so surface failure rather than leaving
      // users staring at a silent no-op.
      if (typeof window !== "undefined") {
        window.alert("PDF export failed. Please try again.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, handleExport };
}

export function ExportButton({
  type,
  data,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const { isExporting, handleExport } = useExportPdf(type, data);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      aria-busy={isExporting}
      className={className}
      aria-label={`Export ${type === "deity" ? (data as DeityExportData).name : (data as StoryExportData).title} as PDF`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </>
      )}
    </Button>
  );
}

// Icon-only variant for compact layouts
export function ExportIconButton({
  type,
  data,
  variant = "ghost",
  className,
}: Omit<ExportButtonProps, "size">) {
  const { isExporting, handleExport } = useExportPdf(type, data);

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleExport}
      disabled={isExporting}
      aria-busy={isExporting}
      className={className}
      aria-label={`Export ${type === "deity" ? (data as DeityExportData).name : (data as StoryExportData).title} as PDF`}
      title="Export as PDF"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
