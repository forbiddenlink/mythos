import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, isValidLocale } from '@/i18n/config';

// Cookie-based locale middleware
// This sets the locale cookie based on Accept-Language header if not already set
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if locale cookie is already set
  const localeCookie = request.cookies.get('locale')?.value;

  if (!localeCookie || !isValidLocale(localeCookie)) {
    // Parse Accept-Language header to detect preferred language
    const acceptLanguage = request.headers.get('accept-language');
    let detectedLocale = defaultLocale;

    if (acceptLanguage) {
      // Parse the Accept-Language header
      // Format: en-US,en;q=0.9,es;q=0.8
      const languages = acceptLanguage
        .split(',')
        .map((lang) => {
          const [code, q = 'q=1'] = lang.trim().split(';');
          return {
            code: code.split('-')[0].toLowerCase(), // Get just the language part
            quality: parseFloat(q.replace('q=', '')) || 1,
          };
        })
        .sort((a, b) => b.quality - a.quality);

      // Find the first supported locale
      for (const lang of languages) {
        if (isValidLocale(lang.code)) {
          detectedLocale = lang.code;
          break;
        }
      }
    }

    // Set the locale cookie
    response.cookies.set('locale', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  return response;
}

// Only run middleware on pages, not on static files or API routes
export const config = {
  matcher: [
    // Match all paths except:
    // - API routes
    // - Static files
    // - Internal Next.js files
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|sw.js|workbox-.*|robots.txt|sitemap.xml).*)',
  ],
};
