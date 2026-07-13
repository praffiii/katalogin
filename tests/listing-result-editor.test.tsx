import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListingResultEditor } from "@/components/listing/ListingResultEditor";

const result = {
  isProductPhoto: true,
  title: "Produk contoh untuk kebutuhan harian",
  seoKeywords: ["produk", "contoh", "harian"],
  description: "Produk ini cocok untuk kebutuhan harian dan mudah digunakan.",
  priceEstimate: {
    min: 10_000,
    max: 20_000,
    currency: "IDR" as const,
    confidence: "low" as const,
    rationale: "Estimasi kasar berdasarkan informasi visual yang tersedia.",
  },
  category: {
    marketplace: "general",
    recommended: "Kategori contoh",
    alternatives: [],
  },
  sellingPoints: ["Mudah digunakan", "Cocok untuk harian", "Dapat diedit"],
  warnings: [],
};

describe("ListingResultEditor", () => {
  it("supports field copy actions and editable price/category guidance", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <ListingResultEditor
        result={result}
        onRegenerate={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Salin judul" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salin deskripsi" }),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Harga minimum (IDR)"));
    await user.type(screen.getByLabelText("Harga minimum (IDR)"), "15000");
    await user.clear(screen.getByLabelText("Kategori utama"));
    await user.type(screen.getByLabelText("Kategori utama"), "Tas baru");
    await user.click(screen.getByRole("button", { name: "Salin draft lengkap" }));

    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining("Tas baru"));
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining("15000"));
  });
});
