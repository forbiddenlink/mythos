import localFont from "next/font/local";

// Google Fonts originals, converted to WOFF2; licenses are in ./fonts/.
export const cinzel = localFont({
  src: "./fonts/cinzel.woff2",
  variable: "--font-cinzel",
  display: "swap",
  weight: "400 800",
  adjustFontFallback: "Times New Roman",
  fallback: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
});

export const sourceSans = localFont({
  src: "./fonts/source-sans-3.woff2",
  variable: "--font-source-sans",
  display: "swap",
  weight: "400 500",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

export const crimsonPro = localFont({
  src: [
    { path: "./fonts/crimson-pro.woff2", style: "normal", weight: "200 900" },
    {
      path: "./fonts/crimson-pro-italic.woff2",
      style: "italic",
      weight: "200 900",
    },
  ],
  variable: "--font-crimson",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
});
