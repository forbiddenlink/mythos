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
import { ZoomIn, ZoomOut, Maximize2, Users } from "lucide-react";

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
      <foreignObject width={232} height={112} x={-116} y={-56}>
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label={ariaLabel}
            className="relative flex w-[13.5rem] cursor-pointer appearance-none items-center gap-3 overflow-hidden rounded-lg border border-border bg-card p-2.5 pr-3 text-left shadow-md transition-shadow hover:border-gold/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
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
              <span className="block truncate font-serif text-[0.95rem] font-semibold leading-tight text-foreground">
                {deity.name}
              </span>
              {domains ? (
                <span className="mt-0.5 block truncate text-xs capitalize text-muted-foreground">
                  {domains}
                </span>
              ) : null}
              {hasChildren ? (
                <span className="mt-1 flex items-center gap-1 text-xs font-medium text-gold-text">
                  <Users className="size-3" aria-hidden />
                  {childLabel}
                </span>
              ) : null}
            </span>
          </button>
          {customNode.relationshipType && (
            <div className="mt-1 rounded-full border border-border bg-background px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
              {customNode.relationshipType}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

// Build hierarchical tree structure
function buildTreeData(
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

export function EnhancedFamilyTree({
  deities,
  relationships,
  focusDeityId,
}: Readonly<EnhancedFamilyTreeProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [measured, setMeasured] = useState(false);

  // react-d3-tree places the root at (translate.x, translate.y); start it
  // centred horizontally near the top, scaled to the frame's width.
  const centre = useCallback(() => {
    const width = containerRef.current?.clientWidth ?? 0;
    if (!width) return;
    const nextZoom = width < 640 ? 0.6 : 0.8;
    setZoom(nextZoom);
    setTranslate({ x: width / 2, y: 90 });
    setMeasured(true);
  }, []);

  // Once the tree has drawn, scale and centre it on its real bounding box so
  // every visible branch fits the frame (wide pantheons would otherwise run
  // off the right-hand edge).
  const fit = useCallback(() => {
    const frame = containerRef.current;
    const group = frame?.querySelector<SVGGElement>("g.rd3t-g");
    if (!frame || !group) return;
    const box = group.getBBox();
    if (!box.width || !box.height) return;
    const pad = 48;
    // Fit when possible, but never shrink the cards below a readable size;
    // wider trees stay centred and pan sideways.
    const minZoom = frame.clientWidth < 640 ? 0.45 : 0.62;
    const nextZoom = Math.max(
      minZoom,
      Math.min(
        0.9,
        (frame.clientWidth - pad) / box.width,
        (frame.clientHeight - pad) / box.height,
      ),
    );
    setZoom(nextZoom);
    setTranslate({
      x: frame.clientWidth / 2 - (box.x + box.width / 2) * nextZoom,
      y: pad / 2 - box.y * nextZoom,
    });
  }, []);

  useLayoutEffect(() => {
    centre();
  }, [centre]);

  useEffect(() => {
    if (!measured) return;
    // After the first layout (and its enter transition) has settled.
    const timer = setTimeout(fit, 650);
    return () => clearTimeout(timer);
  }, [measured, fit]);

  const treeData = useMemo(() => {
    const data = buildTreeData(deities, relationships, focusDeityId);
    return data;
  }, [deities, relationships, focusDeityId]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.2, 0.2));
  }, []);

  const handleReset = useCallback(() => {
    fit();
  }, [fit]);

  if (!treeData) {
    return (
      <div className="flex h-80 items-center justify-center text-center type-ui text-muted-foreground">
        No family tree data available
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-card"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-card"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-card"
          aria-label="Reset view"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Tree Container */}
      <div
        ref={containerRef}
        className="h-[min(72vh,46rem)] min-h-96 w-full overflow-hidden rounded-lg border border-border bg-muted/30 bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_9%,transparent)_1px,transparent_1.5px)] bg-size-[24px_24px]"
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
            orientation="vertical"
            pathFunc="step"
            separation={{ siblings: 1.1, nonSiblings: 1.35 }}
            nodeSize={{ x: 240, y: 180 }}
            renderCustomNodeElement={renderForeignObjectNode}
            collapsible={true}
            initialDepth={2}
            enableLegacyTransitions={true}
            transitionDuration={500}
            depthFactor={200}
            pathClassFunc={() => "custom-link"}
          />
        ) : null}
      </div>

      {/* Legend */}
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
          <span className="h-0.5 w-6 bg-patina" />
          Parent to child
        </li>
        <li className="sm:ml-auto">
          Click a figure to open or close its branch
        </li>
      </ul>
    </div>
  );
}
