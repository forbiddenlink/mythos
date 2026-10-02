"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Tree, { type RawNodeDatum, type TreeNodeDatum } from "react-d3-tree";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  gender: string | null;
  imageUrl?: string;
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description: string | null;
}

interface EnhancedFamilyTreeProps {
  deities: Deity[];
  relationships: Relationship[];
  focusDeityId?: string;
}

interface CustomNodeDatum extends RawNodeDatum {
  deity: Deity;
  relationshipType?: string;
  /** Set when this figure was already drawn, with its line, under this parent. */
  alsoUnder?: string;
}

// Custom node rendering with HTML
const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
}: {
  nodeDatum: TreeNodeDatum;
  toggleNode: () => void;
}) => {
  const customNode = nodeDatum as TreeNodeDatum & {
    deity?: Deity;
    relationshipType?: string;
    alsoUnder?: string;
  };
  const deity = customNode.deity;

  if (!deity) return null;

  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const childCount = nodeDatum.children?.length ?? 0;
  const domains = deity.domain?.slice(0, 2).join(", ") ?? "";
  const childLabel = childCount === 1 ? "1 child" : `${childCount} children`;
  const ariaLabel = [
    deity.name,
    domains && `domains: ${domains}`,
    hasChildren && childLabel,
    customNode.relationshipType && `relation: ${customNode.relationshipType}`,
  ]
    .filter(Boolean)
    .join(". ");

  const accent =
    deity.gender === "male"
      ? "bg-[oklch(0.62_0.09_245)]"
      : deity.gender === "female"
        ? "bg-[oklch(0.62_0.12_350)]"
        : "bg-gold";

  return (
    <g>
      <foreignObject width={264} height={104} x={-132} y={-52}>
        <div className="flex h-full flex-col items-center justify-center">
          <button
            type="button"
            aria-label={ariaLabel}
            className={`relative flex w-[16rem] cursor-pointer appearance-none items-center gap-3 overflow-hidden rounded-lg border border-border bg-card p-2.5 pr-3 text-left shadow-md transition-shadow hover:border-gold/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${customNode.alsoUnder ? "border-dashed border-gold/70" : ""}`}
            onClick={toggleNode}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-1 ${accent}`}
            />
            <span className="relative ml-1 block size-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
              {deity.imageUrl ? (
                <Image
                  src={deity.imageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover object-top"
                />
              ) : (
                <span className="flex h-full items-center justify-center font-serif text-lg font-semibold text-gold-text">
                  {deity.name.charAt(0)}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-[1.125rem] font-semibold leading-tight text-foreground">
                {deity.name}
              </span>
              <span className="mt-0.5 block truncate text-base font-medium text-gold-text">
                {customNode.alsoUnder
                  ? `Also under ${customNode.alsoUnder}`
                  : customNode.relationshipType === "Spouse"
                    ? "Spouse"
                    : hasChildren
                      ? childLabel
                      : (deity.domain?.[0] ?? "").replace(/^./, (c) =>
                          c.toUpperCase(),
                        )}
              </span>
            </span>
          </button>
        </div>
      </foreignObject>
    </g>
  );
};

// Build hierarchical tree structure
export function buildTreeData(
  deities: Deity[],
  relationships: Relationship[],
  rootDeityId?: string,
): CustomNodeDatum | null {
  const deityMap = new Map(deities.map((d) => [d.id, d]));

  // Root: the focused deity, else the parentless figure with the largest
  // line of descendants (so a pantheon opens on its primordial ancestors,
  // not on whichever parentless figure happens to be listed first).
  let rootId = rootDeityId;
  if (!rootId) {
    const parentLinks = relationships.filter((r) =>
      r.relationshipType.toLowerCase().includes("parent"),
    );
    const childIds = new Set(parentLinks.map((r) => r.toDeityId));
    const childrenOf = new Map<string, string[]>();
    for (const r of parentLinks) {
      const list = childrenOf.get(r.fromDeityId) ?? [];
      list.push(r.toDeityId);
      childrenOf.set(r.fromDeityId, list);
    }
    const descendants = (id: string): number => {
      const seen = new Set<string>();
      const stack = [...(childrenOf.get(id) ?? [])];
      while (stack.length > 0) {
        const next = stack.pop() as string;
        if (seen.has(next)) continue;
        seen.add(next);
        stack.push(...(childrenOf.get(next) ?? []));
      }
      return seen.size;
    };
    let best = -1;
    for (const deity of deities) {
      if (childIds.has(deity.id)) continue;
      const count = descendants(deity.id);
      if (count > best) {
        best = count;
        rootId = deity.id;
      }
    }
    rootId ??= deities[0]?.id;
  }

  if (!rootId || !deityMap.has(rootId)) return null;

  // First parent each figure was drawn under. A figure with two parents (a
  // DAG, not a tree) is drawn in full once; later appearances are a stub that
  // points back, so branches are not repeated.
  const placed = new Map<string, string>();
  if (rootId) placed.set(rootId, "");

  const buildNode = (
    deityId: string,
    visited = new Set<string>(),
  ): CustomNodeDatum | null => {
    if (visited.has(deityId)) return null;
    visited.add(deityId);

    const deity = deityMap.get(deityId);
    if (!deity) return null;

    const children: CustomNodeDatum[] = [];

    // Add children
    const childRelationships = relationships.filter(
      (r) =>
        r.fromDeityId === deityId &&
        r.relationshipType.toLowerCase().includes("parent"),
    );

    for (const rel of childRelationships) {
      const again = placed.get(rel.toDeityId);
      const childDeity = deityMap.get(rel.toDeityId);
      if (again !== undefined && childDeity) {
        if (!visited.has(rel.toDeityId)) {
          children.push({
            name: childDeity.name,
            deity: childDeity,
            relationshipType: "Child",
            alsoUnder: again,
          });
        }
        continue;
      }
      placed.set(rel.toDeityId, deity.name);
      const childNode = buildNode(rel.toDeityId, new Set(visited));
      if (childNode) {
        childNode.relationshipType = "Child";
        children.push(childNode);
      }
    }

    // Add spouses as children (shown side by side)
    const spouseRelationships = relationships.filter(
      (r) =>
        (r.fromDeityId === deityId || r.toDeityId === deityId) &&
        r.relationshipType.toLowerCase().includes("spouse"),
    );

    for (const rel of spouseRelationships) {
      const spouseId =
        rel.fromDeityId === deityId ? rel.toDeityId : rel.fromDeityId;
      // A figure already listed as this node's child is not listed twice; the
      // one entry carries both relationships (Gaia and Uranus are linked both
      // ways in the data).
      const asChild = children.find((child) => child.deity.id === spouseId);
      if (asChild) {
        if (asChild.relationshipType === "Child") {
          asChild.relationshipType = "Child and spouse";
        }
        continue;
      }
      if (!visited.has(spouseId)) {
        const spouseDeity = deityMap.get(spouseId);
        if (spouseDeity) {
          children.push({
            name: spouseDeity.name,
            deity: spouseDeity,
            relationshipType: "Spouse",
            children: [],
          });
        }
      }
    }

    return {
      name: deity.name,
      deity,
      children: children.length > 0 ? children : undefined,
    };
  };

  return buildNode(rootId);
}

/** Rendered text must stay at least 14px: 18px names times this floor stay above 14px. */
const READABLE_ZOOM = 0.85;
const PAN_STEP = 160;

function TreeOutline({ node }: Readonly<{ node: CustomNodeDatum }>) {
  const kids = (node.children ?? []) as CustomNodeDatum[];
  return (
    <li>
      <Link
        href={`/deities/${node.deity.slug}`}
        className="inline-flex min-h-11 flex-wrap items-baseline gap-x-2 rounded-md py-1 font-serif text-lg font-semibold text-foreground hover:text-gold-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span
          className={
            node.alsoUnder || node.relationshipType === "Spouse"
              ? "italic text-foreground/75"
              : undefined
          }
        >
          {node.deity.name}
        </span>
        {node.relationshipType ? (
          <span className="font-sans text-base font-medium text-foreground/80">
            (
            {node.alsoUnder
              ? `see ${node.alsoUnder}`
              : node.relationshipType.toLowerCase()}
            )
          </span>
        ) : null}
      </Link>
      {kids.length > 0 ? (
        <ul className="ml-3 border-l border-gold/30 pl-4">
          {kids.map((kid, index) => (
            <TreeOutline key={`${kid.deity.id}-${index}`} node={kid} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

const controlClass = "size-11 bg-card p-0";

export function EnhancedFamilyTree({
  deities,
  relationships,
  focusDeityId,
}: Readonly<EnhancedFamilyTreeProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [measured, setMeasured] = useState(false);
  const measuredRef = useRef(false);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);

  const treeData = useMemo(
    () => buildTreeData(deities, relationships, focusDeityId),
    [deities, relationships, focusDeityId],
  );

  // react-d3-tree places the root at (translate.x, translate.y). The tree
  // grows rightwards, so start with the root at the left, vertically centred.
  const centre = useCallback(() => {
    const frame = containerRef.current;
    if (!frame || !frame.clientWidth) return;
    setZoom(1);
    setTranslate({ x: 160, y: frame.clientHeight / 2 });
    measuredRef.current = true;
    setMeasured(true);
  }, []);

  // Fit to the drawn tree. `all` shows every branch (zoom may fall below the
  // readable floor); otherwise the tree is shown at a readable size, top-left
  // aligned when it is larger than the frame.
  const fit = useCallback((all = false) => {
    const frame = containerRef.current;
    const group = frame?.querySelector<SVGGElement>("g.rd3t-g");
    if (!frame || !group) return;
    const box = group.getBBox();
    if (!box.width || !box.height) return;
    const pad = 32;
    const toFit = Math.min(
      (frame.clientWidth - pad * 2) / box.width,
      (960 - pad * 2) / box.height,
    );
    const nextZoom = all
      ? Math.min(1, Math.max(0.3, toFit))
      : Math.min(1, Math.max(READABLE_ZOOM, toFit));
    const wanted = Math.ceil(box.height * nextZoom + pad * 2);
    const height = Math.max(360, Math.min(wanted, 960));
    setFrameHeight(height);
    setZoom(nextZoom);
    const fitsX = box.width * nextZoom + pad * 2 <= frame.clientWidth;
    const fitsY = box.height * nextZoom + pad * 2 <= height;
    setTranslate({
      x: fitsX
        ? frame.clientWidth / 2 - (box.x + box.width / 2) * nextZoom
        : pad - box.x * nextZoom,
      y: fitsY
        ? height / 2 - (box.y + box.height / 2) * nextZoom
        : pad - box.y * nextZoom,
    });
  }, []);

  // The canvas is hidden below md, so it has no width until the viewport
  // grows; measure as soon as it has one.
  useLayoutEffect(() => {
    centre();
    const frame = containerRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (frame.clientWidth && !measuredRef.current) centre();
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [centre]);

  useEffect(() => {
    if (!measured) return;
    // After the first layout (and its enter transition) has settled.
    const timer = setTimeout(() => fit(), 650);
    return () => clearTimeout(timer);
  }, [measured, fit]);

  const zoomBy = useCallback((delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 2));
  }, []);
  const panBy = useCallback((dx: number, dy: number) => {
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  if (!treeData) {
    return (
      <div className="flex h-80 items-center justify-center text-center type-ui text-muted-foreground">
        No family tree data available
      </div>
    );
  }

  return (
    <div>
      {/* Phones get the same tree as an outline instead of a tiny canvas. */}
      <nav
        aria-label="Family tree outline"
        className="md:hidden rounded-lg border border-border bg-card p-4"
      >
        <ul>
          <TreeOutline node={treeData} />
        </ul>
      </nav>

      <div className="hidden md:block">
        <div
          role="toolbar"
          aria-label="Family tree view controls"
          className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <div className="flex items-center gap-1.5">
            <span className="mr-1 type-meta text-muted-foreground">Zoom</span>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => zoomBy(-0.15)}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-5" />
            </Button>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => zoomBy(0.15)}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-5" />
            </Button>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => fit(true)}
              aria-label="Fit the whole tree"
            >
              <Maximize2 className="size-5" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="mr-1 type-meta text-muted-foreground">Pan</span>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => panBy(PAN_STEP, 0)}
              aria-label="Pan left"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => panBy(0, PAN_STEP)}
              aria-label="Pan up"
            >
              <ArrowUp className="size-5" />
            </Button>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => panBy(0, -PAN_STEP)}
              aria-label="Pan down"
            >
              <ArrowDown className="size-5" />
            </Button>
            <Button
              variant="outline"
              className={controlClass}
              onClick={() => panBy(-PAN_STEP, 0)}
              aria-label="Pan right"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
          <p className="type-meta text-muted-foreground sm:ml-auto">
            Click a figure to open or close its branch. Drag to pan.
          </p>
        </div>

        <div
          ref={containerRef}
          style={frameHeight ? { height: frameHeight } : undefined}
          className="h-[34rem] w-full overflow-hidden [&_.rd3t-link]:stroke-gold/60! [&_.rd3t-link]:stroke-[1.5px]! rounded-lg border border-border bg-muted/30 bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_9%,transparent)_1px,transparent_1.5px)] bg-size-[24px_24px]"
        >
          {measured ? (
            <Tree
              data={treeData}
              translate={translate}
              zoom={zoom}
              onUpdate={(state) => {
                setTranslate(state.translate);
                setZoom(state.zoom);
              }}
              orientation="horizontal"
              pathFunc="step"
              separation={{ siblings: 1, nonSiblings: 1 }}
              nodeSize={{ x: 320, y: 104 }}
              renderCustomNodeElement={renderForeignObjectNode}
              collapsible={true}
              initialDepth={3}
              enableLegacyTransitions={true}
              transitionDuration={500}
              pathClassFunc={() => "custom-link"}
            />
          ) : null}
        </div>

        <ul
          aria-label="Legend"
          className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 type-meta text-muted-foreground"
        >
          <li className="flex items-center gap-2">
            <span className="h-3 w-1 rounded-full bg-[oklch(0.62_0.09_245)]" />
            Male
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-1 rounded-full bg-[oklch(0.62_0.12_350)]" />
            Female
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-1 rounded-full bg-gold" />
            Other or unknown
          </li>
          <li className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-gold/60" />
            Parent to child
          </li>
        </ul>
      </div>
    </div>
  );
}
