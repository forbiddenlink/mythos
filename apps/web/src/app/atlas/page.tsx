import { AetherMap } from "@/components/atlas/AetherMap";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "The Aether Map - Every God, One Sky",
  description:
    "An interactive 3D star map of deities across 13 pantheons, connected by their relationships. Explore world mythology as a living cosmos.",
  url: "/atlas",
  keywords: [
    "mythology map",
    "interactive mythology",
    "pantheon constellation",
    "deity relationships",
    "3D mythology",
    "comparative mythology",
  ],
});

export default function AtlasPage() {
  return <AetherMap />;
}
