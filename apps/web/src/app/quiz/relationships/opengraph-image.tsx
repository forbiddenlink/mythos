import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Divine Relationships Quiz - Mythos Atlas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Static card for the quiz itself.
 *
 * A shared score does not live here: Next passes route params only to
 * `opengraph-image`, never the query string, so a score read from
 * `searchParams` could never render. Shared results go through
 * /quiz/result/relationships-<score>-of-<total>, whose image route reads the
 * score from the path.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a19",
        position: "relative",
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #0a0a19 0%, #0a0a19ee 50%, #d4af3722 100%)",
        }}
      />

      {/* Decorative border */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          border: "2px solid #d4af3744",
          borderRadius: 12,
        }}
      />

      {/* Content */}
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
        {/* Quiz badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 24px",
            backgroundColor: "#d4af3722",
            border: "1px solid #d4af3766",
            borderRadius: 999,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              color: "#d4af37",
              fontSize: 18,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Divine Relationships Quiz
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#f5f0e1",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Test Your Knowledge
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#f5f0e1aa",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          How well do you know the divine family ties across ancient
          mythologies?
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 60px",
          borderTop: "1px solid #d4af3722",
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "#f5f0e188",
            letterSpacing: "0.1em",
          }}
        >
          MYTHOS ATLAS
        </div>
      </div>
    </div>,
    size,
  );
}
