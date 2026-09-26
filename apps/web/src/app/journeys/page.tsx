import { getJourneys, getPantheonShortNames } from "@/lib/data/catalog";
import { JourneysIndex, type JourneyCard } from "./JourneysIndex";

/** Journey index. Card fields are projected on the server. */
export default function JourneysPage() {
  const journeys: JourneyCard[] = getJourneys().map((journey) => {
    const ordered = [...journey.waypoints].sort((a, b) => a.order - b.order);
    return {
      id: journey.id,
      slug: journey.slug,
      title: journey.title,
      heroName: journey.heroName,
      description: journey.description,
      pantheonId: journey.pantheonId,
      duration: journey.duration,
      source: journey.source,
      imageUrl: (journey as { imageUrl?: string | null }).imageUrl ?? null,
      ...(journey.setting ? { setting: journey.setting } : {}),
      stopCount: journey.waypoints.length,
      firstStops: ordered.slice(0, 3).map((w) => w.name),
    };
  });

  return (
    <JourneysIndex
      journeys={journeys}
      pantheonCount={new Set(journeys.map((j) => j.pantheonId)).size}
      traditionNames={getPantheonShortNames()}
    />
  );
}
