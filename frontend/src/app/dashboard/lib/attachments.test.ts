import { describe, expect, it } from "vitest";
import { formatFileSize, isPreviewable, MAX_PREVIEW_SIZE } from "./attachments";

describe("isPreviewable", () => {
  it("allows images under the size cap", () => {
    expect(isPreviewable("image/png", 1024)).toBe(true);
  });

  it("allows PDFs under the size cap", () => {
    expect(isPreviewable("application/pdf", 1024)).toBe(true);
  });

  it("rejects images over the size cap", () => {
    expect(isPreviewable("image/png", MAX_PREVIEW_SIZE + 1)).toBe(false);
  });

  it("rejects non-image/pdf types regardless of size", () => {
    expect(isPreviewable("application/zip", 100)).toBe(false);
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
