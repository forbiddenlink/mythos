'use client';

import { Button } from '@/components/ui/button';
import {
  Sword,
  Heart,
  Brain,
  Skull,
  Waves,
  Sun,
  Leaf,
  Crown,
  Sparkles,
  Hammer,
  Cloud,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Primary domains for the selector (most common/interesting across pantheons)
export const PRIMARY_DOMAINS = [
  { id: 'war', label: 'War', icon: Sword },
  { id: 'love', label: 'Love', icon: Heart },
  { id: 'death', label: 'Death', icon: Skull },
  { id: 'wisdom', label: 'Wisdom', icon: Brain },
  { id: 'sea', label: 'Sea', icon: Waves },
  { id: 'fertility', label: 'Fertility', icon: Leaf },
  { id: 'sky', label: 'Sky', icon: Cloud },
  { id: 'underworld', label: 'Underworld', icon: Skull },
  { id: 'crafts', label: 'Crafts', icon: Hammer },
  { id: 'sun', label: 'Sun', icon: Sun },
  { id: 'magic', label: 'Magic', icon: Sparkles },
  { id: 'sovereignty', label: 'Sovereignty', icon: Crown },
] as const;

// Map domains to icons for lookup
export const DOMAIN_ICONS: Record<string, LucideIcon> = {
  war: Sword,
  warfare: Sword,
  violence: Sword,
  bloodshed: Sword,
  love: Heart,
  beauty: Heart,
  desire: Heart,
  sexuality: Heart,
  marriage: Heart,
  death: Skull,
  underworld: Skull,
  afterlife: Skull,
  wisdom: Brain,
  knowledge: Brain,
  intellect: Brain,
  strategy: Brain,
  sea: Waves,
  water: Waves,
  storms: Cloud,
  fertility: Leaf,
  agriculture: Leaf,
  harvest: Leaf,
  nature: Leaf,
  sky: Cloud,
  thunder: Cloud,
  lightning: Cloud,
  crafts: Hammer,
  metalworking: Hammer,
  forges: Hammer,
  sun: Sun,
  light: Sun,
  magic: Sparkles,
  sorcery: Sparkles,
  trickery: Sparkles,
  sovereignty: Crown,
  kingship: Crown,
  order: Crown,
  law: Crown,
};

export function getDomainIcon(domain: string): LucideIcon {
  return DOMAIN_ICONS[domain.toLowerCase()] || Sparkles;
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
  // Filter to show only domains that have deities if availableDomains is provided
  const domainsToShow = availableDomains
    ? PRIMARY_DOMAINS.filter(d =>
        availableDomains.some(ad => ad.toLowerCase() === d.id.toLowerCase())
      )
    : PRIMARY_DOMAINS;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        variant={selectedDomain === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onDomainSelect(null)}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        All Domains
      </Button>
      {domainsToShow.map(domain => {
        const Icon = domain.icon;
        const isSelected = selectedDomain?.toLowerCase() === domain.id.toLowerCase();
        return (
          <Button
            key={domain.id}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDomainSelect(isSelected ? null : domain.id)}
            className={cn(
              'gap-2 transition-all duration-200',
              isSelected && 'ring-2 ring-gold/30'
            )}
          >
            <Icon className="h-4 w-4" />
            {domain.label}
          </Button>
        );
      })}
    </div>
  );
}
