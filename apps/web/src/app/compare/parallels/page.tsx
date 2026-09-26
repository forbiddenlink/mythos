import {
  getDeities,
  getPantheonShortNames,
  getPantheons,
} from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { ParallelsPageClient, type ParallelEdge } from "./ParallelsPageClient";

/** Every cross-pantheon parallel pair, deduplicated, resolved on the server. */
function buildParallels(): ParallelEdge[] {
  const deities = getDeities();
  const pantheonNames = new Map(Object.entries(getPantheonShortNames()));

  const byId = new Map(deities.map((d) => [d.id, d]));

  const out: ParallelEdge[] = [];
  const seenPairs = new Set<string>();
  for (const d of deities) {
    if (!d.crossPantheonParallels?.length) continue;
    for (const p of d.crossPantheonParallels) {
      const other = byId.get(p.deityId);
      if (!other) continue;
      const a = d.id < other.id ? d.id : other.id;
      const b = d.id < other.id ? other.id : d.id;
      const pairKey = `${a}::${b}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      out.push({
        fromDeityId: d.id,
        fromName: d.name,
        fromSlug: d.slug,
        fromPantheon: pantheonNames.get(d.pantheonId) ?? d.pantheonId,
        fromImage: d.imageUrl ?? undefined,
        toDeityId: other.id,
        toName: other.name,
        toSlug: other.slug,
        toPantheon: pantheonNames.get(other.pantheonId) ?? other.pantheonId,
        toImage: other.imageUrl ?? undefined,
        note: p.note,
      });
    }
  }

  return out.toSorted((a, b) => {
    const fa = `${a.fromName} ${a.toName}`;
    const fb = `${b.fromName} ${b.toName}`;
    return fa.localeCompare(fb);
  });
}

export default function CrossPantheonParallelsPage() {
  return (
    <ParallelsPageClient
      edges={buildParallels()}
      deities={project(getDeities(), [
        "id",
        "name",
        "slug",
        "pantheonId",
        "domain",
        "symbols",
        "description",
        "imageUrl",
      ])}
      pantheons={project(getPantheons(), ["id", "name", "slug"])}
    />
  );
}
