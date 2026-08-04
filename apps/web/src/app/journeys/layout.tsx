import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "Mythological Journeys and Sacred Paths",
  description:
    "Follow legendary journeys across mythic landscapes—pilgrimages, quests, and sacred routes from world mythology.",
  url: "/journeys",
  keywords: [
    "mythology journeys",
    "sacred paths",
    "mythic quests",
    "pilgrimage routes",
    "legendary travels",
  ],
});

export default function JourneysLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
