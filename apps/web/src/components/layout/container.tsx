import type * as React from "react";
import { cn } from "@/lib/utils";

export type ContainerSize = "reading" | "content" | "wide" | "full";

const SIZE_CLASS: Record<ContainerSize, string> = {
  // Max widths include the gutters, so the text measure is exactly the token.
  reading: "layout-container-reading",
  content: "layout-container-content",
  wide: "layout-container-wide",
  full: "max-w-none",
};

interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * `reading` (68ch) for long prose, `content` (1200px) for pages,
   * `wide` (1360px) for galleries and visualizations.
   */
  size?: ContainerSize;
  as?: "div" | "section" | "article" | "nav" | "aside" | "header" | "footer";
}

/**
 * The one horizontal grid. Every page section sits in a Container so edges
 * line up from header to footer; gutters are 16 / 24 / 32px (`--gutter`).
 */
export function Container({
  size = "content",
  as: Tag = "div",
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn("layout-container", SIZE_CLASS[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
