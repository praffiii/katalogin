export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const acceptedImageTypeSet = new Set<string>(ACCEPTED_IMAGE_TYPES);

export class ImageValidationError extends Error {
  constructor(
    public readonly code:
      | "INVALID_IMAGE"
      | "IMAGE_TOO_LARGE"
      | "UNSUPPORTED_MEDIA_TYPE",
  ) {
    super(code);
    this.name = "ImageValidationError";
  }
}

function hasImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte,
    );
  }

  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

export function decodeImageDataUrl(imageBase64: string, declaredMimeType: string) {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
    imageBase64,
  );

  if (!match || match[2].length % 4 !== 0) {
    throw new ImageValidationError("INVALID_IMAGE");
  }

  const dataUrlMimeType = match[1];
  if (
    !acceptedImageTypeSet.has(declaredMimeType) ||
    dataUrlMimeType !== declaredMimeType
  ) {
    throw new ImageValidationError("UNSUPPORTED_MEDIA_TYPE");
  }

  let binary: string;
  try {
    binary = atob(match[2]);
  } catch {
    throw new ImageValidationError("INVALID_IMAGE");
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("IMAGE_TOO_LARGE");
  }

  if (!hasImageSignature(bytes, declaredMimeType)) {
    throw new ImageValidationError("INVALID_IMAGE");
  }

  return {
    base64: match[2],
    bytes,
    declaredMimeType,
    dataUrlMimeType,
  };
}

export function validateImageFile(file: File): string | null {
  if (!acceptedImageTypeSet.has(file.type)) {
    return "Gunakan gambar JPG, PNG, atau WebP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran gambar terlalu besar. Coba gunakan gambar di bawah 3 MB.";
  }

  return null;
}

export function fileToBase64(
  file: File,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abortError = () => new DOMException("The operation was aborted", "AbortError");
    const cleanup = () => signal?.removeEventListener("abort", handleAbort);
    const handleAbort = () => {
      reader.abort();
      cleanup();
      reject(abortError());
    };

    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    signal?.addEventListener("abort", handleAbort, { once: true });
    reader.onload = () => {
      cleanup();
      resolve(String(reader.result));
    };
    reader.onerror = () => {
      cleanup();
      reject(new Error("Failed to read file"));
    };
    reader.onabort = () => {
      cleanup();
      reject(abortError());
    };
    reader.readAsDataURL(file);
  });
}
