import { ImageResponse } from "next/og";
import {
  parseQuizResultSlug,
  quizLabel,
  quizResultVerdict,
} from "@/lib/quiz-share";

export const runtime = "edge";
export const alt = "Mythos Atlas quiz result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MIDNIGHT = "#0a0a19";
const GOLD = "#d4af37";

const GENERIC = {
  title: "Test your mythology",
  blurb:
    "Gods, monsters, artifacts and the stories that bind them, across every pantheon.",
};

/**
 * The score arrives as a route param. Social crawlers never send a query
 * string, so anything read from `searchParams` here would always be empty and
 * every share would carry the same generic card.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ result: string }>;
}) {
  const { result } = await params;
  const parsed = parseQuizResultSlug(result);

  // An unparseable slug gets the generic card rather than a fabricated 0 / 0.
  const percent = parsed
    ? Math.round((parsed.score / parsed.total) * 100)
    : null;
  const verdict = parsed
    ? quizResultVerdict(parsed.score, parsed.total)
    : GENERIC;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: MIDNIGHT,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${MIDNIGHT} 0%, ${MIDNIGHT}ee 55%, ${GOLD}22 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          border: `2px solid ${GOLD}44`,
          borderRadius: 12,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          padding: 60,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: `${GOLD}cc`,
          }}
        >
          Mythos Atlas
        </div>

        {parsed ? (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 28,
              color: GOLD,
            }}
          >
            <span style={{ fontSize: 180, fontWeight: 700, lineHeight: 1 }}>
              {parsed.score}
            </span>
            <span style={{ fontSize: 76, color: `${GOLD}99`, marginLeft: 12 }}>
              / {parsed.total}
            </span>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 54,
            fontWeight: 700,
            color: "#f5f3ef",
            marginTop: 18,
            textAlign: "center",
          }}
        >
          {verdict.title}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#b9b4ab",
            marginTop: 16,
            maxWidth: 820,
            textAlign: "center",
          }}
        >
          {verdict.blurb}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: `${GOLD}cc`,
            marginTop: 40,
          }}
        >
          {percent === null
            ? "mythosatlas.com/quiz"
            : `${percent}% correct · ${quizLabel(parsed?.quizId)}`}
        </div>
      </div>
    </div>,
    size,
  );
}
