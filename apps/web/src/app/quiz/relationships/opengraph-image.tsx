import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Quiz Results - Mythos Atlas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image(props: {
  searchParams?: Promise<{ score?: string; total?: string; difficulty?: string }>;
}) {
  // Handle both Promise and direct object forms of searchParams
  let params: { score?: string; total?: string; difficulty?: string } = {};
  if (props.searchParams) {
    try {
      params = await props.searchParams;
    } catch {
      // If await fails, treat as direct object
      params = props.searchParams as unknown as typeof params;
    }
  }
  const score = params?.score ? parseInt(params.score) : null;
  const total = params?.total ? parseInt(params.total) : null;
  const difficulty = params?.difficulty || 'medium';

  // Default OG image when not sharing results
  if (score === null || total === null) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#0a0a19',
            position: 'relative',
          }}
        >
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #0a0a19 0%, #0a0a19ee 50%, #d4af3722 100%)',
            }}
          />

          {/* Decorative border */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              bottom: 20,
              border: '2px solid #d4af3744',
              borderRadius: 12,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: 60,
              position: 'relative',
            }}
          >
            {/* Quiz badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 24px',
                backgroundColor: '#d4af3722',
                border: '1px solid #d4af3766',
                borderRadius: 999,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  color: '#d4af37',
                  fontSize: 18,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
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
                color: '#f5f0e1',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Test Your Knowledge
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 24,
                color: '#f5f0e1aa',
                textAlign: 'center',
                maxWidth: 700,
              }}
            >
              How well do you know the divine family ties across ancient mythologies?
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 60px',
              borderTop: '1px solid #d4af3722',
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: '#f5f0e188',
                letterSpacing: '0.1em',
              }}
            >
              MYTHOS ATLAS
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const percentage = Math.round((score / total) * 100);

  // Determine message based on score
  let message = 'Keep studying!';
  let emoji = '📚';
  if (percentage === 100) {
    message = 'Perfect Score!';
    emoji = '🏆';
  } else if (percentage >= 80) {
    message = 'Excellent!';
    emoji = '⭐';
  } else if (percentage >= 60) {
    message = 'Well Done!';
    emoji = '👏';
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a19',
          position: 'relative',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0a0a19 0%, #0a0a19ee 50%, #d4af3722 100%)',
          }}
        />

        {/* Decorative border */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '2px solid #d4af3744',
            borderRadius: 12,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: 60,
            position: 'relative',
          }}
        >
          {/* Quiz badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 24px',
              backgroundColor: '#d4af3722',
              border: '1px solid #d4af3766',
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                color: '#d4af37',
                fontSize: 18,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              Quiz Results
            </span>
          </div>

          {/* Score display */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontWeight: 700,
                color: '#d4af37',
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                color: '#f5f0e1aa',
                marginLeft: 8,
              }}
            >
              /{total}
            </div>
          </div>

          {/* Percentage and message */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: '#f5f0e1',
                fontWeight: 600,
              }}
            >
              {percentage}% Mastery
            </div>
            <div
              style={{
                fontSize: 32,
              }}
            >
              {emoji}
            </div>
          </div>

          {/* Message */}
          <div
            style={{
              fontSize: 28,
              color: '#f5f0e1aa',
              marginBottom: 24,
            }}
          >
            {message}
          </div>

          {/* Difficulty badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              backgroundColor: '#ffffff11',
              borderRadius: 8,
            }}
          >
            <span
              style={{
                color: '#f5f0e1aa',
                fontSize: 16,
                textTransform: 'capitalize',
              }}
            >
              {difficulty} Difficulty
            </span>
          </div>

          {/* CTA */}
          <div
            style={{
              fontSize: 20,
              color: '#d4af37',
              marginTop: 32,
            }}
          >
            Can you beat this score?
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 60px',
            borderTop: '1px solid #d4af3722',
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: '#f5f0e188',
              letterSpacing: '0.1em',
            }}
          >
            MYTHOS ATLAS • Divine Relationships Quiz
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
