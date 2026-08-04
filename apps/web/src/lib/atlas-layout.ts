import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";
import { getPantheonColor } from "@/lib/pantheon-colors";

/**
 * Deterministic 3D layout for the Aether Map (the /atlas cosmos).
 *
 * Everything here is a pure function of the static data — NO Math.random and
 * NO Date — so the same star field renders on the server and client and can be
 * unit-tested. Positions come from a stable string hash of each deity id.
 */

export interface AtlasNode {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  color: string;
  position: [number, number, number];
  size: number;
  importanceRank: number;
}

export interface AtlasEdge {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  type: string;
  opacity: number;
}

export interface AtlasPantheon {
  id: string;
  name: string;
  color: string;
  center: [number, number, number];
}

export interface AtlasLayout {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
  pantheons: AtlasPantheon[];
}

interface RawDeity {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  importanceRank?: number;
  crossPantheonParallels?: Array<{
    pantheonId: string;
    deityId: string;
    note?: string;
  }>;
}

interface RawRelationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  confidenceLevel?: string;
}

// FNV-1a style string hash normalised to [0, 1). Stable across environments.
function hash01(str: string, salt = 0): number {
  let h = (2166136261 ^ salt) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

const CLUSTER_RADIUS = 22; // radius of the ring the pantheons sit on
const CLUSTER_SPREAD = 5.5; // how far stars scatter from their pantheon centre
const VERTICAL_JITTER = 9; // vertical offset range between pantheons
const SIZE_MIN = 0.1;
const SIZE_MAX = 0.44;
const RANK_MAX = 14;

export function prettyPantheonName(pantheonId: string): string {
  return pantheonId
    .replace(/-pantheon$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function computeAtlasLayout(): AtlasLayout {
  const deities = deitiesData as unknown as RawDeity[];
  const pantheonIds = [...new Set(deities.map((d) => d.pantheonId))].sort();

  const centers = new Map<string, [number, number, number]>();
  const pantheons: AtlasPantheon[] = pantheonIds.map((pid, i) => {
    const angle = (i / pantheonIds.length) * Math.PI * 2;
    const y = (hash01(pid, 7) - 0.5) * VERTICAL_JITTER;
    const center: [number, number, number] = [
      Math.cos(angle) * CLUSTER_RADIUS,
      y,
      Math.sin(angle) * CLUSTER_RADIUS,
    ];
    centers.set(pid, center);
    return {
      id: pid,
      name: prettyPantheonName(pid),
      color: getPantheonColor(pid),
      center,
    };
  });

  const posById = new Map<string, [number, number, number]>();
  const nodes: AtlasNode[] = deities.map((d) => {
    const center = centers.get(d.pantheonId) ?? [0, 0, 0];
    const rank = d.importanceRank ?? RANK_MAX;
    // importance in [0,1]; 1 = most important (rank 1)
    const importance = 1 - (Math.min(rank, RANK_MAX) - 1) / (RANK_MAX - 1);

    const theta = hash01(d.id, 1) * Math.PI * 2;
    const phi = Math.acos(2 * hash01(d.id, 2) - 1);
    // important stars sit nearer the pantheon centre (like a local sun)
    const r = CLUSTER_SPREAD * (0.3 + (1 - importance) * 0.95);

    const position: [number, number, number] = [
      center[0] + r * Math.sin(phi) * Math.cos(theta),
      center[1] + r * Math.cos(phi),
      center[2] + r * Math.sin(phi) * Math.sin(theta),
    ];
    posById.set(d.id, position);

    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      pantheonId: d.pantheonId,
      color: getPantheonColor(d.pantheonId),
      position,
      size: SIZE_MIN + importance * (SIZE_MAX - SIZE_MIN),
      importanceRank: rank,
    };
  });

  const rels = relationshipsData as unknown as RawRelationship[];
  const edges: AtlasEdge[] = [];
  const seenParallel = new Set<string>();

  for (const r of rels) {
    const from = posById.get(r.fromDeityId);
    const to = posById.get(r.toDeityId);
    if (!from || !to) continue; // skip dangling relationships
    const opacity =
      r.confidenceLevel === "high"
        ? 0.5
        : r.confidenceLevel === "medium"
          ? 0.3
          : 0.16;
    edges.push({ id: r.id, from, to, type: r.relationshipType, opacity });
  }

  // Transmission / syncretism arcs (Mythologis-style) from cross-pantheon parallels
  for (const d of deities) {
    for (const parallel of d.crossPantheonParallels ?? []) {
      const from = posById.get(d.id);
      const to = posById.get(parallel.deityId);
      if (!from || !to) continue;
      const a = [d.id, parallel.deityId].sort().join("::");
      if (seenParallel.has(a)) continue;
      seenParallel.add(a);
      edges.push({
        id: `parallel-${a}`,
        from,
        to,
        type: "syncretism",
        opacity: 0.42,
      });
    }
  }

  return { nodes, edges, pantheons };
}
