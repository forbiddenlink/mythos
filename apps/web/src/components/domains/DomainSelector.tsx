"use client";

import { Button } from "@/components/ui/button";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { cn } from "@/lib/utils";

// Primary domains for the selector (most common/interesting across pantheons)
export const PRIMARY_DOMAINS = [
  { id: "war", label: "War", mark: "blade" as const },
  { id: "love", label: "Love", mark: "myrtle" as const },
  { id: "death", label: "Death", mark: "urn" as const },
  { id: "wisdom", label: "Wisdom", mark: "owl" as const },
  { id: "sea", label: "Sea", mark: "trident" as const },
  { id: "fertility", label: "Fertility", mark: "wheat" as const },
  { id: "sky", label: "Sky", mark: "bolt" as const },
  { id: "underworld", label: "Underworld", mark: "labyrinth" as const },
  { id: "crafts", label: "Crafts", mark: "anvil" as const },
  { id: "sun", label: "Sun", mark: "chronos" as const },
  { id: "magic", label: "Magic", mark: "staff" as const },
  { id: "sovereignty", label: "Sovereignty", mark: "scepter" as const },
] as const;

/** Map domain names → Mythos mark ids */
export const DOMAIN_MARKS: Record<string, MythosMarkId> = {
  war: "blade",
  warfare: "blade",
  violence: "blade",
  bloodshed: "blade",
  love: "myrtle",
  beauty: "myrtle",
  desire: "myrtle",
  sexuality: "myrtle",
  marriage: "myrtle",
  death: "urn",
  underworld: "labyrinth",
  afterlife: "urn",
  wisdom: "owl",
  knowledge: "owl",
  intellect: "owl",
  strategy: "owl",
  sea: "trident",
  water: "trident",
  storms: "bolt",
  fertility: "wheat",
  agriculture: "wheat",
  harvest: "wheat",
  nature: "tree",
  sky: "bolt",
  thunder: "bolt",
  lightning: "bolt",
  crafts: "anvil",
  metalworking: "anvil",
  forges: "anvil",
  sun: "chronos",
  light: "chronos",
  magic: "staff",
  sorcery: "staff",
  trickery: "staff",
  sovereignty: "scepter",
  kingship: "scepter",
  order: "scepter",
  law: "scepter",
};

export function getDomainMarkId(domain: string): MythosMarkId {
  return DOMAIN_MARKS[domain.toLowerCase()] || "constellation";
}

/** @deprecated Use getDomainMarkId + MythosMark */
export function getDomainIcon(domain: string): MythosMarkId {
  return getDomainMarkId(domain);
}

interface DomainSelectorProps {
  selectedDomain: string | null;
  onDomainSelect: (domain: string | null) => void;
  availableDomains?: string[];
  className?: string;
}

export function DomainSelector({
  selectedDomain,
  onDomainSelect,
  availableDomains,
  className,
}: DomainSelectorProps) {
  const domainsToShow = availableDomains
    ? PRIMARY_DOMAINS.filter((d) =>
        availableDomains.some((ad) => ad.toLowerCase() === d.id.toLowerCase()),
      )
    : PRIMARY_DOMAINS;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant={selectedDomain === null ? "default" : "outline"}
        size="sm"
        onClick={() => onDomainSelect(null)}
        className="gap-2"
      >
        <MythosMark id="compass" className="h-4 w-4" />
        All Domains
      </Button>
      {domainsToShow.map((domain) => {
        const isSelected =
          selectedDomain?.toLowerCase() === domain.id.toLowerCase();
        return (
          <Button
            key={domain.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onDomainSelect(isSelected ? null : domain.id)}
            className={cn(
              "gap-2 transition-all duration-200",
              isSelected && "ring-2 ring-gold/30",
            )}
          >
            <MythosMark id={domain.mark} className="h-4 w-4" />
            {domain.label}
          </Button>
        );
      })}
    </div>
  );
}
