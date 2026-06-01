import type { ApiError } from "@/types/listing";

export type ApiErrorCode = ApiError["error"]["code"];

const messages: Record<ApiErrorCode, string> = {
  INVALID_IMAGE: "Gunakan gambar JPG, PNG, atau WebP yang valid.",
  INVALID_PRODUCT_PHOTO:
    "Gunakan foto produk yang jelas, bukan tangkapan layar, struk, selfie, atau gambar lain.",
  IMAGE_TOO_LARGE:
    "Ukuran gambar terlalu besar. Coba gunakan gambar di bawah 4 MB.",
  AI_TIMEOUT:
    "AI belum berhasil membuat listing. Coba lagi dalam beberapa saat.",
  AI_INVALID_RESPONSE: "Respons AI belum lengkap. Coba buat ulang listing.",
  RATE_LIMITED: "Kuota AI sedang penuh. Coba lagi nanti.",
  UNKNOWN: "Terjadi kendala. Coba lagi dalam beberapa saat.",
};

export function apiError(code: ApiErrorCode): ApiError {
  return {
    ok: false,
    error: {
      code,
      message: messages[code],
    },
  };
}
