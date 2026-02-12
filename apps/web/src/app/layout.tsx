import type { Metadata } from "next";
import { Source_Sans_3, Cinzel, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CommandPaletteProvider } from "@/components/command-palette/CommandPaletteProvider";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import { BookmarksProvider } from "@/providers/bookmarks-provider";
import { ProgressProvider } from "@/providers/progress-provider";
import { generateBaseMetadata } from "@/lib/metadata";
import { AudioProvider } from "@/components/audio/AudioContext";
import { AudioControls } from "@/components/audio/AudioControls";

// Cinzel - Elegant classical display font inspired by Roman inscriptions
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Source Sans 3 - Clean, readable UI font
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

// Crimson Pro - Elegant serif for body text and quotes
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className={`${sourceSans.variable} ${cinzel.variable} ${crimsonPro.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <BookmarksProvider>
              <ProgressProvider>
              <AudioProvider>
                <CommandPaletteProvider>
                  <SkipToContent />
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <main id="main-content" className="flex-1" tabIndex={-1}>
                      {children}
                    </main>
                    <Footer />
                  </div>
                  <AudioControls />
                </CommandPaletteProvider>
              </AudioProvider>
              </ProgressProvider>
            </BookmarksProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
