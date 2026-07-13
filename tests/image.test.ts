import { describe, expect, it } from "vitest";
import {
  ImageValidationError,
  decodeImageDataUrl,
  fileToBase64,
  validateImageFile,
} from "@/lib/image";

const tinyPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

describe("decodeImageDataUrl", () => {
  it("rejects malformed base64 before provider processing", () => {
    expect(() =>
      decodeImageDataUrl("data:image/png;base64,%%%", "image/png"),
    ).toThrowError(
      expect.objectContaining({
        code: "INVALID_IMAGE",
      }) as ImageValidationError,
    );
  });

  it("rejects decoded image bytes larger than 3 MiB", () => {
    const bytes = new Uint8Array(3 * 1024 * 1024 + 1);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const base64 = Buffer.from(bytes).toString("base64");

    expect(() =>
      decodeImageDataUrl(`data:image/png;base64,${base64}`, "image/png"),
    ).toThrow(
      expect.objectContaining({
        code: "IMAGE_TOO_LARGE",
      }) as ImageValidationError,
    );
  });

  it("rejects image bytes whose signature does not match the MIME type", () => {
    expect(() =>
      decodeImageDataUrl("data:image/png;base64,AAAAAAAAAAAA", "image/png"),
    ).toThrow(
      expect.objectContaining({
        code: "INVALID_IMAGE",
      }) as ImageValidationError,
    );
  });

  it("rejects disagreement between the declared and data URL MIME types", () => {
    expect(() =>
      decodeImageDataUrl(`data:image/png;base64,${tinyPng}`, "image/jpeg"),
    ).toThrow(
      expect.objectContaining({
        code: "UNSUPPORTED_MEDIA_TYPE",
      }) as ImageValidationError,
    );
  });
});

describe("fileToBase64", () => {
  it("stops reading when the generation signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fileToBase64(
        new File(["image"], "product.png", { type: "image/png" }),
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("validateImageFile", () => {
  it("rejects images larger than 3 MiB", () => {
    const file = new File([new Uint8Array(3 * 1024 * 1024 + 1)], "large.png", {
      type: "image/png",
    });

    expect(validateImageFile(file)).toBe(
      "Ukuran gambar terlalu besar. Coba gunakan gambar di bawah 3 MB.",
    );
  });
});
