import { NextResponse } from "next/server";
import { apiError } from "@/lib/errors";
import { generateListingWithGemini } from "@/lib/gemini";
import { generateListingRequestSchema } from "@/lib/schemas";
import type { GenerateListingResponse } from "@/types/listing";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BASE64_LENGTH = 5_600_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateListingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<GenerateListingResponse>(
        apiError("INVALID_IMAGE"),
        { status: 400 },
      );
    }

    if (parsed.data.imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json<GenerateListingResponse>(
        apiError("IMAGE_TOO_LARGE"),
        { status: 413 },
      );
    }

    const data = await generateListingWithGemini(parsed.data);

    return NextResponse.json<GenerateListingResponse>({
      ok: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("quota") || message.includes("rate")) {
      return NextResponse.json<GenerateListingResponse>(
        apiError("RATE_LIMITED"),
        { status: 429 },
      );
    }

    if (message.includes("invalid_product_photo")) {
      return NextResponse.json<GenerateListingResponse>(
        apiError("INVALID_PRODUCT_PHOTO"),
        { status: 422 },
      );
    }

    if (
      message.includes("json") ||
      message.includes("parse") ||
      message.includes("zod")
    ) {
      return NextResponse.json<GenerateListingResponse>(
        apiError("AI_INVALID_RESPONSE"),
        { status: 502 },
      );
    }

    return NextResponse.json<GenerateListingResponse>(apiError("UNKNOWN"), {
      status: 500,
    });
  }
}
