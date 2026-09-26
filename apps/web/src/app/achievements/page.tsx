import { getTraditionCount } from "@/lib/data/catalog";
import { AchievementsPageClient } from "./AchievementsPageClient";

export default function AchievementsPage() {
  return <AchievementsPageClient traditionCount={getTraditionCount()} />;
}
