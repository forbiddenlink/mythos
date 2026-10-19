import { execFileSync } from "node:child_process";

/** Enforce the screenshot platform when running tests, not inspecting config. */
export default function globalSetup(): void {
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    throw new Error(
      "Visual baselines require macOS 26 on ARM64. Use the macos-26 visual workflow; do not regenerate baselines on another platform.",
    );
  }
  if (
    execFileSync("sw_vers", ["-productVersion"], { encoding: "utf8" })
      .trim()
      .split(".")[0] !== "26"
  ) {
    throw new Error("Visual baselines require macOS major version 26.");
  }
}
