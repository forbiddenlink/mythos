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
import { ReviewProvider } from "@/providers/review-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { cinzel, crimsonPro, sourceSans } from "./fonts";
import "./globals.css";

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
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
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
            nonce={nonce}
          >
            <QueryProvider>
              <BookmarksProvider>
                <ProgressProvider>
                  <ReviewProvider>
                    <LeaderboardProvider>
                      <AchievementNotificationProvider>
                        <SkipToContent />
                        <div className="flex min-h-screen flex-col">
                          <Header />
                          <main
                            id="main-content"
                            className="flex-1 scroll-mt-16"
                            tabIndex={-1}
                          >
                            {children}
                          </main>
                          <Footer />
                        </div>
                        <GlobalClientAddons />
                      </AchievementNotificationProvider>
                    </LeaderboardProvider>
                  </ReviewProvider>
                </ProgressProvider>
              </BookmarksProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
