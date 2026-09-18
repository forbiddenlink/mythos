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
          ? "border-gold/20 bg-card"
          : "border-border/60 bg-card",
        className,
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "font-serif flex items-center gap-2 text-xl",
            isStory ? "text-foreground" : "text-foreground",
          )}
        >
          <Library className="h-5 w-5 text-gold-text shrink-0" aria-hidden />
          {title}
        </CardTitle>
        <CardDescription className={isStory ? "text-muted-foreground" : undefined}>
          Editorial notes for deeper study (not a full bibliography).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul
          className={cn(
            "list-disc space-y-2 pl-5 text-sm leading-relaxed",
            isStory ? "text-foreground" : "text-foreground/85",
          )}
        >
          {lines.map((line, i) => (
            <li key={i} className="break-words">{line}</li>
          ))}
        </ul>
        <p
          className={cn(
            "text-xs pt-1",
            isStory ? "text-muted-foreground" : "text-muted-foreground",
          )}
        >
          Browse representative texts and policies on the{" "}
          <Link
            href="/sources"
            className="underline underline-offset-2 text-gold-text hover:text-gold-text"
          >
            Sources
          </Link>{" "}
          page.
        </p>
      </CardContent>
    </Card>
  );
}
