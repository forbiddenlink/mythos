"use client";

import {
  CinematicStory,
  type StoryScene,
} from "@/components/stories/CinematicStory";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

const ragnarokScenes: StoryScene[] = [
  {
    id: "portents",
    title: "The Seeds of Doom",
    text: "Long before the final battle, the seeds of Ragnarok were sown through acts of treachery and binding. The death of Baldur, the most beloved of the gods, cast the first shadow across the golden halls of Asgard. When Loki's cruelty was finally punished and he was bound beneath the earth with serpent venom dripping upon his face, the countdown to the end began in earnest.",
    mood: "mysterious",
    imageUrl: "/pantheons/norse-pantheon.webp",
  },
  {
    id: "fimbulvetr",
    title: "Fimbulvetr — The Great Winter",
    text: "The first unmistakable sign would be Fimbulvetr, the Terrible Winter: three successive winters with no summer between them. Snow would fall from every direction, and the biting frost would grip the world. All bonds of kinship would dissolve as brother turned against brother.",
    mood: "tragic",
  },
  {
    id: "darkness",
    title: "The Devouring of the Sun",
    text: "The wolves Skoll and Hati, who had pursued the sun and moon across the sky since the beginning of time, would finally catch and devour them. The stars would vanish from the heavens, and the world would be plunged into eternal darkness.",
    mood: "dramatic",
  },
  {
    id: "breaking",
    title: "The Breaking of Bonds",
    text: "With the cosmic order shattered, all the bound forces of chaos would break free. The great wolf Fenrir would snap his bonds and open his terrible jaws so wide that his upper jaw touched the sky and his lower jaw scraped the earth. The Midgard Serpent Jormungandr would release its own tail and rise from the ocean depths, spewing poison across the sky.",
    mood: "dramatic",
    imageUrl: "/deities/jormungandr.webp",
  },
  {
    id: "horn",
    title: "The Final Horn",
    text: "Heimdall, watchman of the gods, would sound the Gjallarhorn one final time, its call reaching every corner of the Nine Worlds. The gods would hold council one last time at the Well of Urd, and then they would arm themselves for battle, knowing they rode to their own deaths.",
    mood: "triumphant",
    imageUrl: "/deities/heimdall.webp",
  },
  {
    id: "odin-fenrir",
    title: "Odin Against the Wolf",
    text: "Odin would lead the charge against Fenrir, the All-Father in his golden armor with his great spear Gungnir. But the wolf would swallow Odin whole, only to be torn apart moments later by Odin's son Vidar, who would place his foot upon Fenrir's lower jaw and rip the beast asunder.",
    mood: "dramatic",
    imageUrl: "/deities/odin.webp",
  },
  {
    id: "thor-serpent",
    title: "Thor's Last Battle",
    text: "Thor would face his ancient enemy Jormungandr one final time. The Thunder God would slay the serpent with his hammer Mjolnir, but stagger only nine steps before falling dead from the creature's venom.",
    mood: "tragic",
    imageUrl: "/deities/thor.webp",
  },
  {
    id: "fire",
    title: "The World in Flames",
    text: "Surtr would cast fire in every direction, and the flames would consume all Nine Worlds. The earth would sink beneath the waves, and it would seem that all existence had come to an end.",
    mood: "dramatic",
  },
  {
    id: "rebirth",
    title: "A New Dawn",
    text: "But the prophecy promises renewal. The earth would rise again from the sea, green and fertile. Two humans, Lif and Lifthrasir, who had sheltered in the World Tree Yggdrasil, would emerge to repopulate the earth. A new sun, daughter of the old one, would ride across the sky. The cycle would begin again.",
    mood: "triumphant",
  },
];

export default function RagnarokCinematicPage() {
  return (
    <div className="min-h-screen bg-midnight">
      <h1 className="sr-only">Ragnarok Cinematic Story</h1>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-midnight via-midnight/80 to-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/stories/ragnarok">
            <Button
              variant="ghost"
              className="text-parchment/70 hover:text-parchment"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Story
            </Button>
          </Link>
          <Link href="/stories/ragnarok">
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
      <CinematicStory title="Ragnarok" scenes={ragnarokScenes} />

      {/* End CTA */}
      <section className="py-20 bg-midnight">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl text-parchment mb-6">
            Continue Your Journey
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/stories/ragnarok">
              <Button className="bg-gold hover:bg-gold-light text-midnight">
                Read the Full Narrative
              </Button>
            </Link>
            <Link href="/pantheons/norse">
              <Button
                variant="outline"
                className="border-gold/30 text-parchment hover:bg-gold/10"
              >
                Explore Norse Mythology
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
