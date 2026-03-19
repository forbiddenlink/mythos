import { defaultLocale, isValidLocale } from "@/i18n/config";
import { NextResponse, type NextRequest } from "next/server";

// Cookie-based locale proxy.
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const localeCookie = request.cookies.get("locale")?.value;

  if (!localeCookie || !isValidLocale(localeCookie)) {
    const acceptLanguage = request.headers.get("accept-language");
    let detectedLocale = defaultLocale;

    if (acceptLanguage) {
      const languages = acceptLanguage
        .split(",")
        .map((lang) => {
          const [code, q = "q=1"] = lang.trim().split(";");
          return {
            code: code.split("-")[0].toLowerCase(),
            quality: Number.parseFloat(q.replace("q=", "")) || 1,
          };
        })
        .sort((a, b) => b.quality - a.quality);

      for (const lang of languages) {
        if (isValidLocale(lang.code)) {
          detectedLocale = lang.code;
          break;
        }
      }
    }

    response.cookies.set("locale", detectedLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|sw.js|workbox-.*|robots.txt|sitemap.xml).*)",
  ],
};
