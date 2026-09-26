import Link from "next/link";
import type { ImageNote } from "@/lib/image-provenance";
import { cn } from "@/lib/utils";

interface IllustrativeImageCaptionProps {
  /** From `getIllustrativeImageNote` on the server; omit for no record. */
  note?: ImageNote;
  /** What the image shows, e.g. the deity's name. */
  subject: string;
  tone?: "light" | "dark";
  className?: string;
}

const METHOD: Record<ImageNote["kind"], string> = {
  "illustration-ai": "Generated with an AI image model",
  "illustration-procedural": "Drawn by code as a decorative plate",
  "public-domain": "Sourced image",
  licensed: "Sourced image",
};

/**
 * Figure caption for a catalog image made for the site. States in visible
 * text (not only a tooltip) that the picture is an interpretation, and links
 * to the explanation on /about#images.
 */
export function IllustrativeImageCaption({
  note,
  subject,
  tone = "dark",
  className,
}: Readonly<IllustrativeImageCaptionProps>) {
  const muted =
    tone === "light" ? "text-parchment/85" : "text-muted-foreground";
  const badge =
    tone === "light"
      ? "border-parchment/40 text-parchment"
      : "border-border text-foreground";
  const link =
    tone === "light"
      ? "text-parchment underline underline-offset-2 hover:text-gold-light"
      : "text-gold-text underline underline-offset-2";
  const method = note ? METHOD[note.kind] : undefined;

  return (
    <figcaption
      className={cn("text-xs leading-relaxed", muted, className)}
      data-testid="illustrative-image-caption"
    >
      <span
        className={cn(
          "mr-1.5 inline-block border px-1.5 py-px text-[0.625rem] font-medium uppercase tracking-[0.12em]",
          badge,
        )}
        title={
          method
            ? `${method} for Mythos Atlas. An interpretation, not a historical artifact.`
            : "Made for Mythos Atlas. An interpretation, not a historical artifact."
        }
      >
        Illustrative image
      </span>
      {subject}
      {method ? `. ${method}; not a historical artifact. ` : ". "}
      <Link href="/about#images" className={link}>
        About our images
      </Link>
    </figcaption>
  );
}
