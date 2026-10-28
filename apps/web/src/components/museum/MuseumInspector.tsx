"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MuseumObject } from "@/lib/museum";

// Descriptions paraphrase the museum's object record, checked 2026-10-18.
// Details are deliberately limited to this documented object, not inferred
// from the figure's name or an AI interpretation of an unrelated image.
const NATARAJA_DETAILS = [
  {
    label: "Circle of flame",
    text: "The flaming halo frames Shiva's dance. The museum connects this image with the continuing cycle of creation and destruction.",
  },
  {
    label: "Hand drum",
    text: "The upper right hand holds a damaru: the drum associated with the first sounds of creation.",
  },
  {
    label: "Flame",
    text: "The upper left hand holds agni, the fire associated with the destruction of the universe.",
  },
  {
    label: "Raised foot",
    text: "The front left hand points toward the raised left foot, which the museum interprets as refuge for the troubled soul.",
  },
] as const;

export function MuseumInspector({ object }: { object: MuseumObject }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const detailId = useId();
  if (!object.imageUrl) return null;
  const details = object.id === "met-39328" ? NATARAJA_DETAILS : [];

  const changeOpen = (value: boolean): void => {
    setOpen(value);
    if (value) {
      setZoom(100);
      setFailed(false);
      setDetail(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mb-4 inline-flex min-h-11 items-center self-start rounded-md border border-border px-3 text-sm font-medium text-gold-text hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label={`Inspect artwork: ${object.title}`}
        >
          Inspect artwork
        </button>
      </DialogTrigger>
      {open ? (
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-5xl overflow-y-auto p-4 sm:p-6 motion-reduce:animate-none [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center">
          <DialogTitle className="pr-12 font-serif leading-snug">
            {object.title}
          </DialogTitle>
          <DialogDescription>
            {object.institution}
            {object.date ? ` · ${object.date}` : ""}. Zoom to inspect the
            photograph; scroll the image to explore its details.
          </DialogDescription>
          <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <div
                className="mb-3 flex flex-wrap items-center gap-2"
                aria-label="Image zoom controls"
              >
                <button
                  type="button"
                  aria-label="Zoom out"
                  disabled={failed || zoom <= 100}
                  onClick={() => setZoom((value) => Math.max(100, value - 50))}
                  className="min-h-11 min-w-11 rounded-md border border-border px-3 disabled:opacity-40"
                >
                  −
                </button>
                <span
                  role="status"
                  className="min-w-12 text-center text-sm tabular-nums"
                >
                  {zoom}%
                </span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  disabled={failed || zoom >= 300}
                  onClick={() => setZoom((value) => Math.min(300, value + 50))}
                  className="min-h-11 min-w-11 rounded-md border border-border px-3 disabled:opacity-40"
                >
                  +
                </button>
                <button
                  type="button"
                  disabled={failed}
                  onClick={() => {
                    setZoom(100);
                    if (viewport.current) {
                      viewport.current.scrollTop = 0;
                      viewport.current.scrollLeft = 0;
                    }
                  }}
                  className="min-h-11 rounded-md border border-border px-3 text-sm disabled:opacity-40"
                >
                  Reset zoom
                </button>
              </div>
              <div
                ref={viewport}
                role="region"
                aria-label="Artwork image, use arrow keys to scroll when zoomed"
                tabIndex={0}
                className="h-[45dvh] min-h-48 overflow-auto rounded-md border border-border bg-midnight focus-visible:outline-2 focus-visible:outline-gold sm:h-[55dvh]"
              >
                {failed ? (
                  <p className="p-6 text-parchment" role="alert">
                    The image could not be loaded. Open the museum record below
                    to view it at its source.
                  </p>
                ) : (
                  <div
                    style={{ width: `${zoom}%`, height: `${zoom}%` }}
                    className="relative"
                  >
                    <Image
                      src={object.imageUrl}
                      alt={object.imageAlt || object.title}
                      fill
                      sizes="(min-width: 768px) 66vw, 100vw"
                      unoptimized
                      className="object-contain"
                      onError={() => setFailed(true)}
                    />
                  </div>
                )}
              </div>
              <p className="mt-2 type-meta text-muted-foreground">
                {object.imageRights}
                {object.accessionNumber ? ` · ${object.accessionNumber}` : ""}
              </p>
            </div>
            <div className="min-w-0 space-y-4">
              <p className="type-ui text-foreground">{object.description}</p>
              {details.length > 0 ? (
                <div>
                  <h3 className="font-serif text-lg">Look closely</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a detail for the museum&apos;s explanation. Left and
                    right refer to the figure.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {details.map((item, index) => (
                      <button
                        type="button"
                        key={item.label}
                        aria-pressed={detail === index}
                        aria-controls={detailId}
                        onClick={() => setDetail(index)}
                        className="min-h-11 rounded-md border border-border px-3 text-sm aria-pressed:border-gold aria-pressed:bg-gold/10"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div
                    id={detailId}
                    aria-live="polite"
                    className="mt-4 text-sm leading-relaxed"
                  >
                    {detail !== null ? (
                      <p>{details[detail].text}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        Choose a detail above.
                      </p>
                    )}
                  </div>
                  <a
                    href={object.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center text-sm text-gold-text underline underline-offset-4"
                  >
                    Museum explanation (opens in new tab)
                  </a>
                </div>
              ) : null}
              <a
                href={object.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm text-gold-text underline underline-offset-4"
              >
                Open museum record (opens in new tab)
              </a>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
