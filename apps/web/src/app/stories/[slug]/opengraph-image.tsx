import { ImageResponse } from 'next/og';
import stories from '@/data/stories.json';
import pantheons from '@/data/pantheons.json';

export const runtime = 'edge';
export const alt = 'Story from Mythos Atlas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const pantheonColors: Record<string, { bg: string; accent: string }> = {
  greek: { bg: '#1a1a2e', accent: '#d4af37' },
  norse: { bg: '#1a2332', accent: '#7cb9e8' },
  egyptian: { bg: '#2d1f14', accent: '#c9a227' },
  roman: { bg: '#2a1a1a', accent: '#8b0000' },
  celtic: { bg: '#1a2e1a', accent: '#228b22' },
  hindu: { bg: '#2e1a2e', accent: '#ff6b35' },
  japanese: { bg: '#1a1a2e', accent: '#dc143c' },
  mesopotamian: { bg: '#2e2a1a', accent: '#cd853f' },
  chinese: { bg: '#2e1a1a', accent: '#ff4500' },
  mesoamerican: { bg: '#1a2e2a', accent: '#00ced1' },
  african: { bg: '#2e2e1a', accent: '#ffd700' },
  polynesian: { bg: '#1a2e2e', accent: '#20b2aa' },
};

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
}

interface Pantheon {
  id: string;
  name: string;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const story = (stories as Story[]).find(s => s.slug === slug || s.id === slug);
  const pantheon = story
    ? (pantheons as Pantheon[]).find(p => p.id === story.pantheonId)
    : null;

  if (!story) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#0a0a19',
            color: '#f5f0e1',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700 }}>Mythos Atlas</div>
          <div style={{ fontSize: 24, opacity: 0.7 }}>Story not found</div>
        </div>
      ),
      { ...size }
    );
  }

  const colors = pantheonColors[story.pantheonId] || { bg: '#1a1a2e', accent: '#d4af37' };

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: colors.bg,
          position: 'relative',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}ee 50%, ${colors.accent}22 100%)`,
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
            border: `2px solid ${colors.accent}44`,
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
          {/* Category badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '8px 24px',
                backgroundColor: `${colors.accent}22`,
                border: `1px solid ${colors.accent}66`,
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  color: colors.accent,
                  fontSize: 16,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}
              >
                {pantheon?.name || story.pantheonId}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                padding: '8px 24px',
                backgroundColor: `${colors.accent}11`,
                border: `1px solid ${colors.accent}44`,
                borderRadius: 999,
              }}
            >
              <span
                style={{
                  color: `${colors.accent}cc`,
                  fontSize: 16,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}
              >
                {story.category}
              </span>
            </div>
          </div>

          {/* Story title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#f5f0e1',
              marginBottom: 32,
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            {story.title}
          </div>

          {/* Summary preview */}
          <div
            style={{
              fontSize: 22,
              color: '#f5f0e1aa',
              maxWidth: 800,
              textAlign: 'center',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            {story.summary.slice(0, 140)}...
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 60px',
            borderTop: `1px solid ${colors.accent}22`,
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
