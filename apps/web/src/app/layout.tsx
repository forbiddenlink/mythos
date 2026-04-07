import { SkipToContent } from "@/components/accessibility/SkipToContent";
import { Footer } from "@/components/layout/footer";
import { GlobalClientAddons } from "@/components/layout/GlobalClientAddons";
import { Header } from "@/components/layout/header";
import { generateBaseMetadata } from "@/lib/metadata";
import { AchievementNotificationProvider } from "@/providers/achievement-notification-provider";
import { BookmarksProvider } from "@/providers/bookmarks-provider";
import { LeaderboardProvider } from "@/providers/leaderboard-provider";
import { ProgressProvider } from "@/providers/progress-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Cinzel, Crimson_Pro, Source_Sans_3 } from "next/font/google";
import "./globals.css";

// Cinzel - Elegant classical display font inspired by Roman inscriptions
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Source Sans 3 - Clean, readable UI font
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500"],
});

// Crimson Pro - Elegant serif for body text and quotes
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    ...generateBaseMetadata({
      title: "Mythos Atlas - Ancient Mythology Encyclopedia",
      description:
        "Explore ancient mythology through interactive deity family trees, comparative analysis, and epic stories from Greek, Norse, Egyptian, and world civilizations. Built by Elizabeth Stein with Next.js and modern web technologies.",
      url: "/",
      locale,
    }),
    icons: {
      icon: [{ url: "/icon.png", type: "image/png" }],
      apple: [{ url: "/apple-icon.png", type: "image/png" }],
      other: [{ rel: "apple-touch-icon", url: "/apple-icon.png" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#d4af37",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className={`${sourceSans.variable} ${cinzel.variable} ${crimsonPro.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <BookmarksProvider>
                <ProgressProvider>
                  <LeaderboardProvider>
                    <AchievementNotificationProvider>
                      <SkipToContent />
                      <div className="flex min-h-screen flex-col">
                        <Header />
                        <main
                          id="main-content"
                          className="flex-1"
                          tabIndex={-1}
                        >
                          {children}
                        </main>
                        <Footer />
                      </div>
                      <GlobalClientAddons />
                    </AchievementNotificationProvider>
                  </LeaderboardProvider>
                </ProgressProvider>
              </BookmarksProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
