import { describe, expect, it, vi } from "vitest";
import type { jsPDF as PdfDocument } from "jspdf";

const captured = vi.hoisted(() => ({ document: null as PdfDocument | null }));

vi.mock("jspdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jspdf")>();
  return {
    jsPDF: class extends actual.jsPDF {
      constructor(options: ConstructorParameters<typeof actual.jsPDF>[0]) {
        super(options);
        captured.document = this;
        this.save = vi.fn().mockReturnValue(this);
      }
    },
  };
});

import { exportDeityToPdf } from "@/lib/pdf-export";

describe("deity PDF source provenance", () => {
  it("exports references without reviving withheld legacy quotations", async () => {
    await exportDeityToPdf({
      name: "Example figure",
      primarySources: [
        {
          source: "Reference record",
          date: "700 BCE",
          text: "Unchecked quotation wording",
        },
      ],
    });
    const output = captured.document!.output();
    expect(output).toContain("Source notes");
    expect(output).toContain("Reference record");
    expect(output).toContain("700 BCE");
    expect(output).not.toContain("Unchecked quotation wording");
    expect(captured.document!.save).toHaveBeenCalledWith(
      "example-figure-mythos-atlas.pdf",
    );
  });
});
