import { describe, expect, it } from "vitest";
import {
  decodeCitationsHeader,
  encodeCitationsHeader,
  type OracleCitation,
} from "@/lib/oracle/citations";

describe("oracle citations codec", () => {
  it("round-trips UTF-8 titles", () => {
    const rows: OracleCitation[] = [
      {
        type: "deity",
        slug: "zeus",
        title: "Zeus — King",
        path: "/deities/zeus",
      },
    ];
    const enc = encodeCitationsHeader(rows);
    expect(decodeCitationsHeader(enc)).toEqual(rows);
  });

  it("returns empty on garbage", () => {
    expect(decodeCitationsHeader("not-valid")).toEqual([]);
  });
});
