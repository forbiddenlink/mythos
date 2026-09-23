import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  SourceExcerpt,
  type PrimarySourceExcerpt,
} from "@/components/sources/SourceExcerpt";

const verifiedExcerpt: PrimarySourceExcerpt = {
  text: "Μῆνιν ἄειδε θεὰ",
  translation: "Sing, goddess, the wrath.",
  source: "Homer, Iliad",
  sourceId: "iliad",
  lineNumbers: "1.1",
  translator: "Verified Translator",
  originalLanguage: "Ancient Greek",
  quoteStatus: "direct-quotation",
  verification: "verified",
  sourceUrl: "https://example.com/iliad/1.1",
  edition: "Verified edition",
};

describe("SourceExcerpt", () => {
  it("presents a verified quotation and permits its verified transcription", () => {
    render(<SourceExcerpt excerpt={verifiedExcerpt} />);

    expect(screen.getByText("Direct quotation")).toBeInTheDocument();
    expect(screen.getByText(/“Sing, goddess, the wrath.”/)).toBeInTheDocument();
    expect(document.querySelector("blockquote")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ancient Greek" }));
    expect(screen.getByText(/Μῆνιν ἄειδε θεὰ/)).toHaveAttribute("lang", "grc");
    expect(screen.getByRole("button", { name: "Translation" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it.each([
    [
      "direct-quotation",
      "source-and-locator-verified",
      "Original wording unverified",
    ],
    ["editorial-paraphrase", "verified", "Editorial paraphrase"],
    ["unverified", "not-verified", "Verification pending"],
  ] as const)(
    "does not quote or expose original text for %s records",
    (quoteStatus, verification, statusLabel) => {
      render(
        <SourceExcerpt
          excerpt={{
            ...verifiedExcerpt,
            quoteStatus,
            verification,
            text: "Unverified original",
            translation: "Editorially presented text.",
          }}
        />,
      );

      expect(screen.getByText(statusLabel)).toBeInTheDocument();
      expect(document.querySelector("blockquote")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Ancient Greek" }),
      ).not.toBeInTheDocument();
      if (verification === "not-verified") {
        expect(
          screen.queryByText("Editorially presented text."),
        ).not.toBeInTheDocument();
        expect(screen.getByText(/Its wording is withheld/)).toBeInTheDocument();
      } else {
        expect(
          screen.getByText("Editorially presented text."),
        ).toBeInTheDocument();
      }
      expect(screen.queryByText("Unverified original")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Read source/ })).toHaveAttribute(
        "href",
        verifiedExcerpt.sourceUrl,
      );
    },
  );
});
