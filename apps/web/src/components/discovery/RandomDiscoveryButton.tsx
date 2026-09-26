"use client";

import { useState, useContext } from "react";
import { ArrowRight } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProgressContext } from "@/providers/progress-provider";
import { loadDeityIndex } from "@/lib/catalog-client";

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain?: string[];
  symbols?: string[];
  description?: string;
}

/** Prefer unvisited deities and cold pantheons (skill-mapper decay pattern). */
function pickDiscoveryDeity(
  deities: Deity[],
  exclude: string | undefined,
  viewedIds: string[],
  exploredPantheons: string[],
): Deity {
  const viewed = new Set(viewedIds);
  const coldPantheons = new Set(
    [...new Set((deities as Deity[]).map((d) => d.pantheonId))].filter(
      (p) => !exploredPantheons.includes(p),
    ),
  );

  const pool = (deities as Deity[]).filter((d) => d.id !== exclude);

  const unvisitedCold = pool.filter(
    (d) => !viewed.has(d.id) && coldPantheons.has(d.pantheonId),
  );
  if (unvisitedCold.length > 0) {
    return unvisitedCold[Math.floor(Math.random() * unvisitedCold.length)];
  }

  const unvisited = pool.filter((d) => !viewed.has(d.id));
  if (unvisited.length > 0 && Math.random() < 0.7) {
    return unvisited[Math.floor(Math.random() * unvisited.length)];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function RandomDiscoveryButton() {
  const progress = useContext(ProgressContext);
  const [isOpen, setIsOpen] = useState(false);
  const [deity, setDeity] = useState<Deity | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function discover(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      // Slim index (~⅕ of deities.json), fetched once on first discovery intent.
      const deities = await loadDeityIndex();
      setDeity(
        pickDiscoveryDeity(
          deities,
          deity?.id,
          progress?.progress.deitiesViewed ?? [],
          progress?.progress.pantheonsExplored ?? [],
        ),
      );
    } catch {
      setError("Couldn’t load a deity. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) void discover();
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="min-h-11 px-0 text-muted-foreground"
          aria-label="Discover a random deity"
        >
          <MythosMark id="lot" className="size-4" /> Discover a random deity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto">
        <p className="text-sm capitalize text-gold-text">
          {deity?.pantheonId.replace("-pantheon", "").replaceAll("-", " ")}
        </p>
        <DialogTitle className="font-serif text-3xl">
          {deity?.name ?? "Discover a deity"}
        </DialogTitle>
        <DialogDescription className="capitalize">
          {deity?.domain?.slice(0, 3).join(", ")}
        </DialogDescription>
        {loading && <p role="status">Finding a deity…</p>}
        {error && <p role="alert">{error}</p>}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {deity?.description}
        </p>
        {deity?.symbols?.length ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Symbols: </span>
            {deity.symbols.slice(0, 4).join(", ")}
          </p>
        ) : null}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={() => void discover()}
          >
            Another
          </Button>
          {deity && (
            <Button asChild variant="gold" className="flex-1">
              <Link
                href={`/deities/${deity.slug}`}
                onClick={() => setIsOpen(false)}
              >
                Explore <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
