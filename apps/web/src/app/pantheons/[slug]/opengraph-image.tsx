import { ImageResponse } from 'next/og';
import pantheons from '@/data/pantheons.json';

export const runtime = 'edge';
export const alt = 'Pantheon information from Mythos Atlas';
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

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const pantheon = (pantheons as Pantheon[]).find(p => p.slug === slug || p.id === slug);

  if (!pantheon) {
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
          <div style={{ fontSize: 24, opacity: 0.7 }}>Pantheon not found</div>
        </div>
      ),
      { ...size }
    );
  }

  const colors = pantheonColors[pantheon.id] || { bg: '#1a1a2e', accent: '#d4af37' };

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
          {/* Category badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 24px',
              backgroundColor: `${colors.accent}22`,
              border: `1px solid ${colors.accent}66`,
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                color: colors.accent,
                fontSize: 18,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              Pantheon
            </span>
          </div>

          {/* Pantheon name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#f5f0e1',
              marginBottom: 16,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            {pantheon.name} Mythology
          </div>

          {/* Region & Culture */}
          <div
            style={{
              fontSize: 28,
              color: colors.accent,
              marginBottom: 32,
              textAlign: 'center',
            }}
          >
            {pantheon.culture} • {pantheon.region}
          </div>

          {/* Description preview */}
          <div
            style={{
              fontSize: 20,
              color: '#f5f0e1aa',
              maxWidth: 800,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {pantheon.description.slice(0, 150)}...
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
