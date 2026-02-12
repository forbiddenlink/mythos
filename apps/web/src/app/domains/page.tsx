'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sword,
  Heart,
  Brain,
  Skull,
  Waves,
  Sun,
  Moon,
  Cloud,
  Flame,
  Leaf,
  Crown,
  Scale,
  Sparkles,
  Search,
  ChevronLeft,
  Zap,
  Mountain,
  Wind,
  Eye,
  Shield,
  Music,
  Feather,
  Star,
  Compass,
  BookOpen,
  Hammer,
  Gem,
  Home,
  Baby,
  TreePine,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import deitiesData from '@/data/deities.json';
import pantheonsData from '@/data/pantheons.json';

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  imageUrl: string | null;
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

// Map domains to icons
const domainIcons: Record<string, LucideIcon> = {
  // War & Combat
  war: Sword,
  warfare: Sword,
  fighting: Sword,
  violence: Sword,
  bloodshed: Sword,
  military: Shield,
  'military prowess': Shield,
  heroism: Shield,
  victory: Shield,
  strategy: Shield,

  // Love & Relationships
  love: Heart,
  beauty: Heart,
  desire: Heart,
  sexuality: Heart,
  marriage: Heart,
  fertility: Heart,
  family: Home,
  childbirth: Baby,
  women: Heart,
  motherhood: Heart,
  devotion: Heart,
  compassion: Heart,
  tenderness: Heart,

  // Wisdom & Knowledge
  wisdom: Brain,
  knowledge: Brain,
  intellect: Brain,
  learning: BookOpen,
  writing: BookOpen,
  poetry: Feather,
  prophecy: Eye,
  foreknowledge: Eye,
  truth: Eye,

  // Death & Underworld
  death: Skull,
  underworld: Skull,
  afterlife: Skull,
  mummification: Skull,
  embalming: Skull,
  cemeteries: Skull,
  mourning: Skull,

  // Sea & Water
  sea: Waves,
  water: Waves,
  freshwater: Waves,
  Nile: Waves,
  storms: Cloud,
  rain: Cloud,

  // Sky & Weather
  sky: Cloud,
  thunder: Zap,
  lightning: Zap,
  air: Wind,
  wind: Wind,

  // Sun & Light
  sun: Sun,
  light: Sun,
  sunshine: Sun,

  // Moon & Night
  moon: Moon,
  night: Moon,

  // Fire & Forge
  fire: Flame,
  volcanoes: Flame,
  forges: Hammer,
  metalworking: Hammer,
  crafts: Hammer,
  craft: Hammer,
  sculpture: Hammer,

  // Nature & Earth
  nature: Leaf,
  earth: Mountain,
  wilderness: TreePine,
  hunting: TreePine,
  hunt: TreePine,
  agriculture: Wheat,
  harvest: Wheat,
  grain: Wheat,
  rice: Wheat,
  spring: Leaf,

  // Power & Rulership
  sovereignty: Crown,
  kingship: Crown,
  'ideal kingship': Crown,
  'pharaonic power': Crown,
  'imperial authority': Crown,
  power: Crown,
  order: Crown,
  law: Scale,

  // Justice & Balance
  justice: Scale,
  judgment: Scale,
  balance: Scale,
  'cosmic order': Scale,
  dharma: Scale,
  'sacred law': Scale,
  oaths: Scale,

  // Magic & Mystery
  magic: Sparkles,
  sorcery: Sparkles,
  trickery: Sparkles,
  mischief: Sparkles,
  chaos: Sparkles,
  transformation: Sparkles,

  // Arts & Creation
  music: Music,
  arts: Music,
  dance: Music,
  theater: Music,
  creation: Star,

  // Travel & Boundaries
  travelers: Compass,
  messenger: Compass,
  messengers: Compass,
  boundaries: Compass,
  doorways: Compass,
  gates: Compass,
  transitions: Compass,
  beginnings: Compass,

  // Wealth & Commerce
  wealth: Gem,
  commerce: Gem,
  fortune: Gem,
  prosperity: Gem,
  thieves: Gem,

  // Home & Hearth
  home: Home,
  hearth: Home,
  domesticity: Home,
  'domestic arts': Home,

  // Animals
  horses: Leaf,
  cats: Leaf,
  foxes: Leaf,
  crocodiles: Leaf,
  jaguars: Leaf,

  // Other
  wine: Sparkles,
  ecstasy: Sparkles,
  madness: Sparkles,
  healing: Sparkles,
  protection: Shield,
  purity: Star,
  innocence: Star,
  virginity: Star,
  peace: Leaf,
};

// Get icon for a domain (with fallback)
function getDomainIcon(domain: string): LucideIcon {
  return domainIcons[domain.toLowerCase()] || Sparkles;
}

// Capitalize first letter of each word
function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get pantheon name by ID
function getPantheonName(pantheonId: string): string {
  const pantheon = (pantheonsData as Pantheon[]).find(p => p.id === pantheonId);
  return pantheon?.name.replace(' Pantheon', '') || pantheonId;
}

export default function DomainsPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pantheonFilter, setPantheonFilter] = useState<string>('all');

  // Extract all unique domains and count deities
  const domainData = useMemo(() => {
    const domainMap = new Map<string, Deity[]>();

    (deitiesData as Deity[]).forEach(deity => {
      deity.domain?.forEach(domain => {
        const existing = domainMap.get(domain) || [];
        domainMap.set(domain, [...existing, deity]);
      });
    });

    return Array.from(domainMap.entries())
      .map(([domain, deities]) => ({
        domain,
        deities,
        count: deities.length,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // Filter domains by search
  const filteredDomains = useMemo(() => {
    if (!searchQuery) return domainData;
    return domainData.filter(d =>
      d.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [domainData, searchQuery]);

  // Get deities for selected domain, filtered by pantheon
  const selectedDomainDeities = useMemo(() => {
    if (!selectedDomain) return [];
    const domainItem = domainData.find(d => d.domain === selectedDomain);
    if (!domainItem) return [];

    if (pantheonFilter === 'all') return domainItem.deities;
    return domainItem.deities.filter(d => d.pantheonId === pantheonFilter);
  }, [selectedDomain, domainData, pantheonFilter]);

  // Get unique pantheons from the selected domain's deities
  const availablePantheons = useMemo(() => {
    if (!selectedDomain) return [];
    const domainItem = domainData.find(d => d.domain === selectedDomain);
    if (!domainItem) return [];

    const pantheonIds = [...new Set(domainItem.deities.map(d => d.pantheonId))];
    return pantheonIds
      .map(id => ({
        id,
        name: getPantheonName(id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDomain, domainData]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background - using existing hero pattern */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-midnight via-midnight/95 to-midnight">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          </div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/50 via-midnight/40 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Compass className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Divine Spheres of Influence
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Domains
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Explore the divine domains of mythology - from war and wisdom to love and death - and discover the deities who rule over each sphere
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-4 py-16 bg-mythic">
        <Breadcrumbs />

        {selectedDomain ? (
          // Deities View for Selected Domain
          <div className="mt-8">
            {/* Back button and Domain header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedDomain(null);
                    setPantheonFilter('all');
                  }}
                  className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>All Domains</span>
                </button>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getDomainIcon(selectedDomain);
                    return (
                      <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
                        <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-parchment">
                      {capitalize(selectedDomain)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {domainData.find(d => d.domain === selectedDomain)?.count || 0} deities
                    </p>
                  </div>
                </div>
              </div>

              {/* Pantheon filter */}
              {availablePantheons.length > 1 && (
                <Select value={pantheonFilter} onValueChange={setPantheonFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by pantheon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pantheons</SelectItem>
                    {availablePantheons.map(pantheon => (
                      <SelectItem key={pantheon.id} value={pantheon.id}>
                        {pantheon.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Deities Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {selectedDomainDeities.map(deity => (
                <Link key={deity.id} href={`/deities/${deity.slug}`}>
                  <Card className="group h-full cursor-pointer card-elevated bg-card hover:scale-[1.01]">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {deity.imageUrl ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold/20 shadow-sm flex-shrink-0">
                            <Image
                              src={deity.imageUrl}
                              alt={deity.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300 flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-foreground group-hover:text-gold transition-colors duration-300">
                            {deity.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getPantheonName(deity.pantheonId)}
                          </p>
                          {deity.domain && deity.domain.length > 1 && (
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              Also: {deity.domain.filter(d => d !== selectedDomain).slice(0, 3).map(capitalize).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {selectedDomainDeities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No deities found for this domain in the selected pantheon.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Domain Cards Grid
          <>
            {/* Search */}
            <div className="mt-8 mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Domain Grid */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredDomains.map(({ domain, count }) => {
                const Icon = getDomainIcon(domain);
                return (
                  <Card
                    key={domain}
                    className="group cursor-pointer card-elevated bg-card hover:scale-[1.02] transition-all duration-300"
                    onClick={() => setSelectedDomain(domain)}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300 mb-4">
                        <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-gold transition-colors duration-300">
                        {capitalize(domain)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {count} {count === 1 ? 'deity' : 'deities'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredDomains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No domains found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
