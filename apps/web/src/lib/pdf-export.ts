"use client";

import { jsPDF } from "jspdf";

export interface DeityExportData {
  name: string;
  alternateNames?: string[];
  description?: string | null;
  detailedBio?: string | null;
  originStory?: string | null;
  domain?: string[];
  symbols?: string[];
  pantheonId?: string;
  imageUrl?: string | null;
  primarySources?: Array<{
    text: string;
    source: string;
    date?: string;
  }>;
  worship?: {
    temples?: string[];
    festivals?: string[];
    practices?: string;
  };
}

export interface StoryExportData {
  title: string;
  summary: string;
  fullNarrative?: string | null;
  category: string;
  moralThemes?: string[];
  culturalSignificance?: string;
  pantheonId?: string;
  featuredDeities?: string[];
}

const COLORS = {
  gold: "#D4AF37",
  midnight: "#1a1a2e",
  parchment: "#F5E6D3",
  text: "#333333",
  lightGray: "#666666",
};

const PAGE_MARGIN = 20;
const LINE_HEIGHT = 7;
const CONTENT_WIDTH = 170; // A4 width (210) - 2 * margin (20)

function sanitizeText(text: string): string {
  // Remove markdown formatting
  return text
    .replaceAll(/#{1,6}\s/g, "")
    .replaceAll("**", "")
    .replaceAll("*", "")
    .replaceAll("`", "")
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replaceAll(/\n{3,}/g, "\n\n");
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  paragraphs.forEach((paragraph) => {
    if (paragraph.trim() === "") {
      lines.push("");
      return;
    }

    const wrappedLines = doc.splitTextToSize(paragraph, maxWidth);
    lines.push(...wrappedLines);
  });

  return lines;
}

function addHeader(doc: jsPDF, title: string): number {
  let yPos = PAGE_MARGIN;

  // Logo/Brand header
  doc.setFillColor(COLORS.midnight);
  doc.rect(0, 0, 210, 40, "F");

  // Brand text
  doc.setTextColor(COLORS.gold);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MYTHOS ATLAS", PAGE_MARGIN, 25);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Explore the Ancient World of Mythology", PAGE_MARGIN, 33);

  yPos = 50;

  // Title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const titleLines = wrapText(doc, title, CONTENT_WIDTH);
  titleLines.forEach((line) => {
    doc.text(line, PAGE_MARGIN, yPos);
    yPos += 10;
  });

  // Decorative line
  yPos += 5;
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, yPos, PAGE_MARGIN + 50, yPos);

  return yPos + 10;
}

function addSection(
  doc: jsPDF,
  title: string,
  content: string,
  yPos: number,
): number {
  // Check if we need a new page
  if (yPos > 260) {
    doc.addPage();
    yPos = PAGE_MARGIN;
  }

  // Section title
  doc.setTextColor(COLORS.gold);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, PAGE_MARGIN, yPos);
  yPos += LINE_HEIGHT + 2;

  // Section content
  doc.setTextColor(COLORS.text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const sanitized = sanitizeText(content);
  const lines = wrapText(doc, sanitized, CONTENT_WIDTH);

  lines.forEach((line) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = PAGE_MARGIN;
    }
    doc.text(line, PAGE_MARGIN, yPos);
    yPos += LINE_HEIGHT;
  });

  return yPos + 5;
}

function addBadges(
  doc: jsPDF,
  title: string,
  items: string[],
  yPos: number,
): number {
  if (!items || items.length === 0) return yPos;

  // Check if we need a new page
  if (yPos > 260) {
    doc.addPage();
    yPos = PAGE_MARGIN;
  }

  // Section title
  doc.setTextColor(COLORS.gold);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, PAGE_MARGIN, yPos);
  yPos += LINE_HEIGHT + 2;

  // Badges
  doc.setFontSize(10);
  let xPos = PAGE_MARGIN;

  items.forEach((item) => {
    const textWidth = doc.getTextWidth(item) + 10;

    if (xPos + textWidth > PAGE_MARGIN + CONTENT_WIDTH) {
      xPos = PAGE_MARGIN;
      yPos += 10;
    }

    // Badge background
    doc.setFillColor(245, 230, 211); // parchment color
    doc.roundedRect(xPos, yPos - 5, textWidth, 8, 2, 2, "F");

    // Badge border
    doc.setDrawColor(COLORS.gold);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, yPos - 5, textWidth, 8, 2, 2, "S");

    // Badge text
    doc.setTextColor(COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.text(item, xPos + 5, yPos);

    xPos += textWidth + 5;
  });

  return yPos + 15;
}

function addSources(
  doc: jsPDF,
  sources: Array<{ text: string; source: string; date?: string }>,
  yPos: number,
): number {
  if (!sources || sources.length === 0) return yPos;

  const references = sources.map((source) =>
    source.date
      ? `${source.source} (catalog date: ${source.date})`
      : source.source,
  );
  return addSection(
    doc,
    "Source notes",
    [
      "These catalog references have not been checked against an edition. Unverified passage wording is not reproduced.",
      ...references,
    ].join("\n\n"),
    yPos,
  );
}

function addFooter(doc: jsPDF, _pageCount: number): void {
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, 285, 190, 285);

    // Footer text
    doc.setTextColor(COLORS.lightGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Mythos Atlas - Explore Ancient Mythology", PAGE_MARGIN, 290);
    doc.text(`Page ${i} of ${totalPages}`, 175, 290);

    // Date
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generated: ${date}`, PAGE_MARGIN + 70, 290);
  }
}

export async function exportDeityToPdf(deity: DeityExportData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = addHeader(doc, deity.name);

  // Alternate names
  if (deity.alternateNames && deity.alternateNames.length > 0) {
    doc.setTextColor(COLORS.lightGray);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Also known as: ${deity.alternateNames.join(", ")}`,
      PAGE_MARGIN,
      yPos,
    );
    yPos += LINE_HEIGHT + 5;
  }

  // Pantheon
  if (deity.pantheonId) {
    doc.setTextColor(COLORS.lightGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Pantheon: ${deity.pantheonId.charAt(0).toUpperCase() + deity.pantheonId.slice(1)}`,
      PAGE_MARGIN,
      yPos,
    );
    yPos += LINE_HEIGHT + 5;
  }

  // Domains
  if (deity.domain && deity.domain.length > 0) {
    yPos = addBadges(doc, "Domains", deity.domain, yPos);
  }

  // Symbols
  if (deity.symbols && deity.symbols.length > 0) {
    yPos = addBadges(doc, "Symbols", deity.symbols, yPos);
  }

  // Biography
  if (deity.detailedBio) {
    yPos = addSection(doc, "About", deity.detailedBio, yPos);
  } else if (deity.description) {
    yPos = addSection(doc, "Description", deity.description, yPos);
  }

  // Origin Story
  if (deity.originStory) {
    yPos = addSection(doc, "Origin Story", deity.originStory, yPos);
  }

  // Worship
  if (deity.worship) {
    if (deity.worship.temples && deity.worship.temples.length > 0) {
      yPos = addSection(
        doc,
        "Sacred Temples",
        deity.worship.temples.join("\n"),
        yPos,
      );
    }
    if (deity.worship.festivals && deity.worship.festivals.length > 0) {
      yPos = addBadges(doc, "Festivals", deity.worship.festivals, yPos);
    }
    if (deity.worship.practices) {
      yPos = addSection(
        doc,
        "Worship Practices",
        deity.worship.practices,
        yPos,
      );
    }
  }

  // Primary Sources
  if (deity.primarySources && deity.primarySources.length > 0) {
    yPos = addSources(doc, deity.primarySources, yPos);
  }

  // Add footer to all pages
  addFooter(doc, doc.getNumberOfPages());

  // Download
  const filename = `${deity.name.toLowerCase().replaceAll(/\s+/g, "-")}-mythos-atlas.pdf`;
  doc.save(filename);
}

export async function exportStoryToPdf(story: StoryExportData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPos = addHeader(doc, story.title);

  // Category
  doc.setTextColor(COLORS.lightGray);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Category: ${story.category}`, PAGE_MARGIN, yPos);
  yPos += LINE_HEIGHT + 3;

  // Pantheon
  if (story.pantheonId) {
    doc.text(
      `Pantheon: ${story.pantheonId.charAt(0).toUpperCase() + story.pantheonId.slice(1)}`,
      PAGE_MARGIN,
      yPos,
    );
    yPos += LINE_HEIGHT + 5;
  }

  // Themes
  if (story.moralThemes && story.moralThemes.length > 0) {
    yPos = addBadges(doc, "Themes", story.moralThemes, yPos);
  }

  // The Tale
  if (story.fullNarrative) {
    yPos = addSection(doc, "The Tale", story.fullNarrative, yPos);
  } else {
    yPos = addSection(doc, "Summary", story.summary, yPos);
  }

  // Cultural Significance
  if (story.culturalSignificance) {
    yPos = addSection(
      doc,
      "Cultural Significance",
      story.culturalSignificance,
      yPos,
    );
  }

  // Featured Characters
  if (story.featuredDeities && story.featuredDeities.length > 0) {
    yPos = addBadges(doc, "Featured Characters", story.featuredDeities, yPos);
  }

  // Add footer to all pages
  addFooter(doc, doc.getNumberOfPages());

  // Download
  const filename = `${story.title.toLowerCase().replaceAll(/\s+/g, "-")}-mythos-atlas.pdf`;
  doc.save(filename);
}
