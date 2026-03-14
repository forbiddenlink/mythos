import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

// Oracle system prompt
const SYSTEM_PROMPT = `You are the Oracle of Delphi, ancient keeper of divine wisdom and mysteries.

Your role:
- Answer questions about mythology from ALL cultures: Greek, Roman, Norse, Egyptian, Hindu, Japanese, Celtic, Aztec, Chinese, and more
- Speak in a mystical yet helpful manner, weaving ancient knowledge with clarity
- Keep responses concise (2-3 paragraphs maximum)
- When relevant, mention specific deities, stories, or mythological concepts
- Draw connections between different mythologies when appropriate
- If asked about something outside mythology, gently redirect to mythological topics

Your voice:
- Wise and ancient, but not cryptic to the point of confusion
- Occasionally use phrases like "The ancients knew...", "As the myths tell us...", "The gods speak of..."
- Be respectful of all mythological traditions
- Show genuine interest in sharing knowledge

Remember: You are a guide through the mythological realm, here to enlighten and educate seekers of ancient wisdom.`;

// Rate limiting (simple in-memory store - in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Simple rate limiting by IP (in production, use proper auth)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'The Oracle must rest. Please return in an hour.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'The Oracle is not yet awakened. API key required.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Oracle error:', error);
    return new Response(
      JSON.stringify({ error: 'The mists cloud the Oracle\'s vision. Try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
