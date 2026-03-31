"use client";

import {
  CinematicStory,
  type StoryScene,
} from "@/components/stories/CinematicStory";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

const titanomachyScenes: StoryScene[] = [
  {
    id: "cronus-reign",
    title: "The Reign of Cronus",
    text: "In the age before the Olympians, the Titan Cronus ruled supreme over the cosmos. He had seized power from his own father, Ouranos, castrating him with an adamantine sickle at the urging of his mother Gaia. But power won through violence carries with it a terrible curse: the prophecy that Cronus himself would be overthrown by his own offspring.",
    mood: "mysterious",
    imageUrl: "/pantheons/greek-pantheon.webp",
  },
  {
    id: "devouring",
    title: "The Devouring",
    text: "Consumed by fear of the prophecy, Cronus devoured each of his children the moment they were born. One by one, the gods who would become the great Olympians vanished into the darkness of their father's belly: Hestia, Demeter, Hera, Hades, and Poseidon. The Titaness Rhea, their mother, watched in horror as child after child disappeared.",
    mood: "tragic",
  },
  {
    id: "birth-zeus",
    title: "The Birth of Zeus",
    text: "When Rhea was pregnant with her sixth child, she could bear no more grief. She traveled to Crete, to the hidden cave of Dicte on Mount Ida, where she gave birth to Zeus in secret. In place of the infant, she wrapped a great stone in swaddling clothes and presented it to Cronus, who swallowed it without suspicion.",
    mood: "mysterious",
    imageUrl: "/deities/zeus.webp",
  },
  {
    id: "hidden-king",
    title: "The Hidden King",
    text: "The young Zeus grew in hiding, nourished by the goat Amaltheia and guarded by the Kouretes, warrior spirits who clashed their shields and spears to drown out the baby's cries. In the shadow of the mountain, the future king of the gods grew strong.",
    mood: "calm",
  },
  {
    id: "liberation",
    title: "The Liberation",
    text: "When Zeus reached maturity, he returned to challenge his father. With the aid of the Titaness Metis, who prepared an emetic potion, Zeus forced Cronus to disgorge his siblings. First came the great stone, which Zeus later set at Delphi as an eternal monument. Then, one by one, his brothers and sisters emerged: Poseidon, Hades, Hera, Demeter, and Hestia, fully grown and burning with righteous anger.",
    mood: "triumphant",
  },
  {
    id: "war-begins",
    title: "The Ten-Year War",
    text: "The war that followed was unlike anything the universe had ever witnessed. The Olympians established their stronghold on Mount Olympus, while the Titans rallied under Cronus on Mount Othrys. For ten years the two sides clashed, their battles shaking the very foundations of the earth.",
    mood: "dramatic",
  },
  {
    id: "weapons",
    title: "The Divine Weapons",
    text: "Zeus descended to Tartarus and freed the Hundred-Handed Ones and the Cyclopes. The Cyclopes forged terrible weapons for the Olympians: the thunderbolt for Zeus, the trident for Poseidon, and the helm of invisibility for Hades.",
    mood: "triumphant",
    imageUrl: "/deities/hephaestus.webp",
  },
  {
    id: "final-battle",
    title: "The Cataclysm",
    text: "The final battle was cataclysmic. Zeus unleashed his thunderbolts in an endless barrage, Poseidon shook the earth and sea, and Hades struck terror into the hearts of the Titans with his unseen presence. The boundless sea roared terribly around, the great earth rumbled, and broad heaven groaned, shaken.",
    mood: "dramatic",
  },
  {
    id: "new-order",
    title: "The New Order",
    text: "Victorious, the three brothers divided the cosmos by lot. Zeus received the sky, Poseidon the sea, and Hades the underworld. The defeated Titans were cast into Tartarus, guarded eternally by the Hundred-Handed Ones. A new age had begun.",
    mood: "triumphant",
  },
];

export default function TitanomachyCinematicPage() {
  return (
    <div className="min-h-screen bg-midnight">
      <h1 className="sr-only">Titanomachy Cinematic Story</h1>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-midnight via-midnight/80 to-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/stories/titanomachy">
            <Button
              variant="ghost"
              className="text-parchment/70 hover:text-parchment"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Story
            </Button>
          </Link>
          <Link href="/stories/titanomachy">
            <Button
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Read Full Text
            </Button>
          </Link>
        </div>
      </nav>

      {/* Cinematic Story */}
      <CinematicStory title="The Titanomachy" scenes={titanomachyScenes} />

      {/* End CTA */}
      <section className="py-20 bg-midnight">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl text-parchment mb-6">
            Continue Your Journey
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/stories/titanomachy">
              <Button className="bg-gold hover:bg-gold-light text-midnight">
                Read the Full Narrative
              </Button>
            </Link>
            <Link href="/pantheons/greek">
              <Button
                variant="outline"
                className="border-gold/30 text-parchment hover:bg-gold/10"
              >
                Explore Greek Mythology
              </Button>
            </Link>
            <Link href="/stories">
              <Button
                variant="ghost"
                className="text-parchment/70 hover:text-parchment"
              >
                More Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
