import assert from "node:assert/strict";
import test from "node:test";
import { parseListingResponseText } from "../lib/ai-response.ts";

test("non-product AI JSON becomes invalid product photo error", () => {
  assert.throws(
    () => parseListingResponseText('{"isProductPhoto":false}'),
    /INVALID_PRODUCT_PHOTO/,
  );
});
