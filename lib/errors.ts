import type { ApiError } from "@/types/listing";

export type ApiErrorCode = ApiError["error"]["code"];

const messages: Record<ApiErrorCode, string> = {
  INVALID_REQUEST: "Periksa kembali data yang dikirim.",
  INVALID_IMAGE: "Gunakan gambar JPG, PNG, atau WebP yang valid.",
  UNSUPPORTED_MEDIA_TYPE: "Format gambar tidak sesuai atau tidak didukung.",
  INVALID_PRODUCT_PHOTO:
    "Gunakan foto produk yang jelas, bukan tangkapan layar, struk, selfie, atau gambar lain.",
  IMAGE_TOO_LARGE:
    "Ukuran gambar terlalu besar. Coba gunakan gambar di bawah 4 MB.",
  AI_TIMEOUT:
    "AI belum berhasil membuat listing. Coba lagi dalam beberapa saat.",
  AI_INVALID_RESPONSE: "Respons AI belum lengkap. Coba buat ulang listing.",
  RATE_LIMITED: "Batas penggunaan AI tercapai. Coba lagi nanti.",
  CONCURRENCY_LIMITED: "Permintaan AI lain masih diproses. Coba lagi sebentar.",
  SERVICE_UNAVAILABLE: "Layanan pembuatan draft sedang tidak tersedia.",
  UNKNOWN: "Terjadi kendala. Coba lagi dalam beberapa saat.",
};

export function apiError(
  code: ApiErrorCode,
  details: Pick<ApiError["error"], "requestId" | "fields"> = {},
): ApiError {
  return {
    ok: false,
    error: {
      code,
      message: messages[code],
      ...details,
    },
  };
}
