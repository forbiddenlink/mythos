import { describe, expect, it } from "vitest";
import { classroomShareUrl } from "@/components/worksheet/ClassroomShareButton";

describe("classroomShareUrl", () => {
  it("points Classroom at the absolute page URL", () => {
    const url = new URL(classroomShareUrl("/pantheons/greek/worksheet"));
    expect(url.origin + url.pathname).toBe("https://classroom.google.com/share");
    expect(url.searchParams.get("url")).toBe(
      "https://mythosatlas.com/pantheons/greek/worksheet",
    );
    expect(url.searchParams.has("title")).toBe(false);
  });

  it("encodes the title", () => {
    const url = new URL(classroomShareUrl("/study/odyssey", "Odyssey & Iliad"));
    expect(url.searchParams.get("title")).toBe("Odyssey & Iliad");
  });
});
