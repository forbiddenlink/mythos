import Link from "next/link";
import { cn } from "@/lib/utils";

interface EditorialBylineProps {
  className?: string;
  tone?: "light" | "dark";
}

export function EditorialByline({
  className,
  tone = "dark",
}: Readonly<EditorialBylineProps>) {
  const mutedClass =
    tone === "light" ? "text-slate-200/85" : "text-muted-foreground";
  const accentClass =
    tone === "light" ? "text-white underline" : "text-gold underline";

  return (
    <p className={cn("text-sm leading-6", mutedClass, className)}>
      By Elizabeth Stein for Mythos Atlas.{" "}
      <Link href="/about" rel="author" className={accentClass}>
        About the author
      </Link>
      . Editorial notes are grounded in the site&apos;s{" "}
      <Link href="/sources" className={accentClass}>
        cited sources
      </Link>{" "}
      and can be challenged through the{" "}
      <Link href="/contact" className={accentClass}>
        contact page
      </Link>
      .
    </p>
  );
}
