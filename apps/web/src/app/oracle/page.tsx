import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { isOracleEnabled } from "@/lib/oracle/availability";
import { OracleConsult } from "@/components/oracle/OracleConsult";
import { ParchmentShaderBackground } from "@/components/effects/ParchmentShaderBackground";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

const baseMetadata: Metadata = generateBaseMetadata({
  title: "The Oracle of Delphi",
  description:
    "Consult the Oracle — an AI seer grounded in the Mythos Atlas's own sources. Pose a petition about the gods, myths, and their meanings, and receive a prophecy with citations.",
  url: "/oracle",
  type: "website",
  keywords: [
    "oracle",
    "delphi",
    "mythology AI",
    "ask about mythology",
    "pythia",
    "mythos atlas oracle",
  ],
});

export function generateMetadata(): Metadata {
  // A disabled Oracle is an empty shell: keep it out of search results.
  return isOracleEnabled()
    ? baseMetadata
    : { ...baseMetadata, robots: { index: false, follow: true } };
}

export default function OraclePage() {
  const oracleEnabled = isOracleEnabled();
  return (
    <div className="dark relative min-h-screen overflow-hidden bg-midnight text-parchment">
      {/* Atmospheric temple background — GLSL parchment/candlelight, with a
          matching static gradient fallback baked in for SSR and low-power. */}
      <ParchmentShaderBackground />

      <Container className="relative pt-5">
        <Breadcrumbs tone="onDark" />
      </Container>
      <div className="layout-container layout-container-content relative max-w-4xl! pt-10 pb-20 sm:pt-16 sm:pb-28">
        {/* Invocation */}
        <header className="text-center">
          <p className="type-eyebrow mb-4 text-gold-light">
            The Sanctuary at Delphi
          </p>
          <h1 className="page-title text-parchment">The Oracle</h1>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-gold/40" />
            <span className="h-2 w-2 rotate-45 bg-gold/60" />
            <span className="h-px w-16 bg-gold/40" />
          </div>
          <p className="type-lede mx-auto mt-8 max-w-2xl text-parchment/85">
            In the old world, seekers climbed to Delphi to put their questions
            to the Pythia and left with a prophecy to puzzle over. Put yours to
            this Oracle: a seer that answers from the Atlas&rsquo;s own gods,
            myths, and sources — and shows you where each answer was drawn from.
          </p>
        </header>

        {/* Consultation */}
        <section className="mt-14">
          {oracleEnabled ? (
            <OracleConsult />
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-gold/20 bg-midnight/50 p-8 text-center">
              <p className="font-serif text-xl text-gold-light">
                The Oracle sleeps
              </p>
              <p className="mt-3 text-parchment/80">
                No prophecies are being given at this hour. The reference pages,
                family trees, and readings await you in the meantime.
              </p>
            </div>
          )}
        </section>

        {/* Rites — how the Oracle answers */}
        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Grounded in the Atlas",
              body: "Each petition is answered from the encyclopedia's own deities, stories, and primary sources — not free invention.",
            },
            {
              title: "Cited, not asserted",
              body: "Where the Oracle draws on a source, it names it, so you can follow the thread back to the reference page.",
            },
            {
              title: "Answered sparingly",
              body: "Like the ancient rite, the Oracle speaks a limited number of times each day. If she is silent, return later.",
            },
          ].map((rite) => (
            <div
              key={rite.title}
              className="rounded-xl border border-gold/15 bg-midnight/40 p-6"
            >
              <h2 className="font-serif text-lg text-gold-light">
                {rite.title}
              </h2>
              <p className="mt-3 type-ui text-parchment/80">{rite.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
