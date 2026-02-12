'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  exportDeityToPdf,
  exportStoryToPdf,
  type DeityExportData,
  type StoryExportData
} from '@/lib/pdf-export';

interface DeityExportButtonProps {
  type: 'deity';
  data: DeityExportData;
  variant?: 'default' | 'outline' | 'ghost' | 'gold';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

interface StoryExportButtonProps {
  type: 'story';
  data: StoryExportData;
  variant?: 'default' | 'outline' | 'ghost' | 'gold';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

type ExportButtonProps = DeityExportButtonProps | StoryExportButtonProps;

export function ExportButton({
  type,
  data,
  variant = 'outline',
  size = 'default',
  className
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      if (type === 'deity') {
        await exportDeityToPdf(data as DeityExportData);
      } else {
        await exportStoryToPdf(data as StoryExportData);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
      aria-label={`Export ${type === 'deity' ? (data as DeityExportData).name : (data as StoryExportData).title} as PDF`}
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
  variant = 'ghost',
  className
}: Omit<ExportButtonProps, 'size'>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      if (type === 'deity') {
        await exportDeityToPdf(data as DeityExportData);
      } else {
        await exportStoryToPdf(data as StoryExportData);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
      aria-label={`Export ${type === 'deity' ? (data as DeityExportData).name : (data as StoryExportData).title} as PDF`}
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
