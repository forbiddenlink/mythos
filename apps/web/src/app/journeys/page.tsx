import { getJourneys } from "@/lib/data/catalog";
import { JourneysPageClient, type JourneyCard } from "./JourneysPageClient";

/** Journey index. Card fields are projected on the server. */
export default function JourneysPage() {
  const journeys: JourneyCard[] = getJourneys().map((journey) => ({
    id: journey.id,
    slug: journey.slug,
    title: journey.title,
    heroName: journey.heroName,
    description: journey.description,
    pantheonId: journey.pantheonId,
    duration: journey.duration,
    source: journey.source,
    ...(journey.setting ? { setting: journey.setting } : {}),
    waypoints: journey.waypoints.map((w) => ({
      id: w.id,
      name: w.name,
      order: w.order,
      ...(w.coordinates ? { coordinates: w.coordinates } : {}),
    })),
  }));

  return (
    <JourneysPageClient
      journeys={journeys}
      pantheonCount={new Set(journeys.map((j) => j.pantheonId)).size}
    />
  );
}
