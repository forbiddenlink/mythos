import type { Metadata } from "next";
import { Source_Sans_3, Cinzel, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CommandPaletteProvider } from "@/components/command-palette/CommandPaletteProvider";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import { BookmarksProvider } from "@/providers/bookmarks-provider";
import { ProgressProvider } from "@/providers/progress-provider";
import { AchievementNotificationProvider } from "@/providers/achievement-notification-provider";
import { generateBaseMetadata } from "@/lib/metadata";
import { AudioProvider } from "@/components/audio/AudioContext";
import { AudioControls } from "@/components/audio/AudioControls";
import { InstallPrompt, OfflineIndicator } from "@/components/pwa";

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

export const metadata: Metadata = {
  ...generateBaseMetadata({
    title: "Mythos Atlas - Ancient Mythology Encyclopedia",
    description: "Explore ancient mythology through interactive deity family trees, comparative analysis, and epic stories from Greek, Norse, Egyptian, and world civilizations. Built by Elizabeth Stein with Next.js and modern web technologies.",
    url: "/",
  }),
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
  },
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mythos Atlas" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${sourceSans.variable} ${cinzel.variable} ${crimsonPro.variable} font-sans antialiased`}>
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
                <AchievementNotificationProvider>
                <AudioProvider>
                  <CommandPaletteProvider>
                    <SkipToContent />
                    <OfflineIndicator />
                    <div className="flex min-h-screen flex-col">
                      <Header />
                      <main id="main-content" className="flex-1" tabIndex={-1}>
                        {children}
                      </main>
                      <Footer />
                    </div>
                    <AudioControls />
                    <InstallPrompt />
                  </CommandPaletteProvider>
                </AudioProvider>
                </AchievementNotificationProvider>
                </ProgressProvider>
              </BookmarksProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
