import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CommandPaletteProvider } from "@/components/command-palette/CommandPaletteProvider";
import { SkipToContent } from "@/components/accessibility/SkipToContent";
import { generateBaseMetadata } from "@/lib/metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythos Atlas - Ancient Mythology Encyclopedia",
  description: "Explore ancient mythology through interactive deity family trees, cultural maps, and epic story timelines from civilizations around the world.",
  url: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <CommandPaletteProvider>
              <SkipToContent />
              <div className="flex min-h-screen flex-col">
                <Header />
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
            </CommandPaletteProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
