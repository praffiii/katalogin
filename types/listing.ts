export type Marketplace = "shopee" | "tokopedia" | "tiktok" | "general";

export type GenerateListingRequest = {
  imageBase64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  productName?: string;
  condition?: "new" | "used";
  marketplace?: Marketplace;
  notes?: string;
};

export type ListingResult = {
  isProductPhoto: boolean;
  title: string;
  seoKeywords: string[];
  description: string;
  priceEstimate: {
    min: number;
    max: number;
    currency: "IDR";
    confidence: "low" | "medium" | "high";
    rationale: string;
  };
  category: {
    marketplace: string;
    recommended: string;
    alternatives: string[];
  };
  sellingPoints: string[];
  warnings: string[];
};

export type ApiSuccess = {
  ok: true;
  data: ListingResult;
};

export type ApiError = {
  ok: false;
  error: {
    code:
      | "INVALID_IMAGE"
      | "INVALID_PRODUCT_PHOTO"
      | "IMAGE_TOO_LARGE"
      | "AI_TIMEOUT"
      | "AI_INVALID_RESPONSE"
      | "RATE_LIMITED"
      | "UNKNOWN";
    message: string;
  };
};

export type GenerateListingResponse = ApiSuccess | ApiError;
