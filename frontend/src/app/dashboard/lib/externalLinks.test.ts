import { describe, expect, it } from "vitest";
import { externalHref } from "./externalLinks";

describe("externalHref", () => {
  it("keeps absolute links external", () => {
    expect(externalHref("https://jobs.example/apply")).toBe(
      "https://jobs.example/apply",
    );
  });

  it("adds https to extracted bare domains", () => {
    expect(externalHref("jobs.example/apply")).toBe(
      "https://jobs.example/apply",
    );
  });

  it("rejects non-web URLs", () => {
    expect(externalHref("mailto:jobs@example.com")).toBeNull();
  });
});
