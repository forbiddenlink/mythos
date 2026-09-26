"use client";

import { useId, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { GitBranch } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import {
  SegmentedControl,
  StageLoading,
  ToolToolbar,
} from "@/components/layout/tool-stage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy load the heavy tree libraries; each view fetches only its own code.
const FamilyTreeVisualization = dynamic(
  () =>
    import("@/components/family-tree/FamilyTreeVisualization").then((mod) => ({
      default: mod.FamilyTreeVisualization,
    })),
  {
    loading: () => (
      <StageLoading
        mark="constellation"
        label="Drawing the network…"
        className="h-[min(70vh,42rem)] min-h-96 rounded-lg border border-border"
      />
    ),
    ssr: false,
  },
);

const EnhancedFamilyTree = dynamic(
  () =>
    import("@/components/family-tree/EnhancedFamilyTree").then((mod) => ({
      default: mod.EnhancedFamilyTree,
    })),
  {
    loading: () => (
      <StageLoading
        mark="tree"
        label="Drawing the family tree…"
        className="h-[min(72vh,46rem)] min-h-96 rounded-lg border border-border"
      />
    ),
    ssr: false,
  },
);

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  gender: string | null;
  pantheonId?: string;
  imageUrl?: string;
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description: string | null;
}

interface FamilyTreePageClientProps {
  pantheonsData: Array<{ id: string; name: string }>;
  deitiesData: Deity[];
  relationshipsData: Relationship[];
}

type ViewMode = "hierarchical" | "network";

export function FamilyTreePageClient({
  pantheonsData,
  deitiesData,
  relationshipsData,
}: Readonly<FamilyTreePageClientProps>) {
  const selectId = useId();
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
  const [selectedPantheon, setSelectedPantheon] =
    useState<string>("greek-pantheon");

  const { deities, relationships } = useMemo(() => {
    const filteredDeities = deitiesData.filter(
      (d) => d.pantheonId === selectedPantheon,
    );
    const deityIds = new Set(filteredDeities.map((d) => d.id));
    return {
      deities: filteredDeities,
      relationships: relationshipsData.filter(
        (r) => deityIds.has(r.fromDeityId) && deityIds.has(r.toDeityId),
      ),
    };
  }, [deitiesData, relationshipsData, selectedPantheon]);

  const pantheonName =
    pantheonsData.find((p) => p.id === selectedPantheon)?.name ?? "";

  return (
    <div>
      <ToolToolbar label="Family tree controls">
        <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
          <label
            htmlFor={selectId}
            className="type-ui font-medium text-muted-foreground"
          >
            Pantheon
          </label>
          <Select value={selectedPantheon} onValueChange={setSelectedPantheon}>
            <SelectTrigger
              id={selectId}
              className="min-h-10 w-full min-w-0 flex-1 sm:w-60 sm:flex-none"
            >
              <SelectValue placeholder="Select Pantheon" />
            </SelectTrigger>
            <SelectContent>
              {pantheonsData.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SegmentedControl<ViewMode>
          label="Visualization"
          value={viewMode}
          onChange={setViewMode}
          options={[
            {
              value: "hierarchical",
              ariaLabel: "Hierarchical family tree view",
              label: (
                <>
                  <GitBranch className="size-4" aria-hidden="true" />
                  Family tree
                </>
              ),
            },
            {
              value: "network",
              ariaLabel: "Network family tree view",
              label: (
                <>
                  <MythosMark id="constellation" className="size-4" />
                  Network
                </>
              ),
            },
          ]}
        />
        <p className="type-ui text-muted-foreground lg:ml-auto">
          <span className="font-medium text-foreground">{pantheonName}</span>
          {" · "}
          {deities.length} figures · {relationships.length} relationships
        </p>
      </ToolToolbar>

      <div className="mt-5">
        {deities.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-center">
            <MythosMark id="tree" className="size-10 text-gold-text" />
            <p className="type-ui text-muted-foreground">
              No family tree data is recorded for this pantheon yet.
            </p>
          </div>
        ) : viewMode === "hierarchical" ? (
          <EnhancedFamilyTree
            key={selectedPantheon}
            deities={deities}
            relationships={relationships}
          />
        ) : (
          <FamilyTreeVisualization
            key={selectedPantheon}
            deities={deities}
            relationships={relationships}
          />
        )}
      </div>
    </div>
  );
}
