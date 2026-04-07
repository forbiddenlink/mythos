"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Library } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EntityPlainSourcesListProps {
  lines: string[];
  title?: string;
  variant?: "story" | "deity";
  className?: string;
}

export function EntityPlainSourcesList({
  lines,
  title = "References & further reading",
  variant = "deity",
  className,
}: EntityPlainSourcesListProps) {
  if (!lines?.length) return null;

  const isStory = variant === "story";

  return (
    <Card
      className={cn(
        isStory
          ? "border-gold/20 bg-midnight-light/50"
          : "border-border/60 bg-card",
        className,
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "font-serif flex items-center gap-2 text-xl",
            isStory ? "text-parchment" : "text-foreground",
          )}
        >
          <Library className="h-5 w-5 text-gold shrink-0" aria-hidden />
          {title}
        </CardTitle>
        <CardDescription className={isStory ? "text-parchment/60" : undefined}>
          Editorial notes for deeper study (not a full bibliography).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul
          className={cn(
            "list-disc space-y-2 pl-5 text-sm leading-relaxed",
            isStory ? "text-parchment/85" : "text-foreground/85",
          )}
        >
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <p
          className={cn(
            "text-xs pt-1",
            isStory ? "text-parchment/45" : "text-muted-foreground",
          )}
        >
          Browse representative texts and policies on the{" "}
          <Link
            href="/sources"
            className="underline underline-offset-2 text-gold hover:text-gold/90"
          >
            Sources
          </Link>{" "}
          page.
        </p>
      </CardContent>
    </Card>
  );
}
