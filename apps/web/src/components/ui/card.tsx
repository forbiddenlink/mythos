import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  // Base styles - no glass effect by default for better performance
  [
    "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border/60 py-6",
    "shadow-sm transition-all duration-200",
    "hover:shadow-md hover:border-border hover:-translate-y-0.5",
    "dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-black/20",
    // Focus styles - gold themed
    "group-focus-visible:ring-2 group-focus-visible:ring-gold/50 group-focus-visible:ring-offset-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: "",
        glass: "glass-card",
        elevated: "card-elevated",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
  /**
   * When true, applies role="article" for self-contained content pieces.
   * Use for cards representing distinct items (e.g., deity cards, story cards).
   * Omit for container/section cards where native div semantics are sufficient.
   */
  asArticle?: boolean
}

function Card({ className, asArticle, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      role={asArticle ? "article" : undefined}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-tight font-serif font-semibold text-xl tracking-wide", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
