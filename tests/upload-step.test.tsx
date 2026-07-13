import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UploadStep } from "@/components/draft-flow/UploadStep";

describe("UploadStep", () => {
  it("states the accepted formats, 3 MB limit, and provider processing", () => {
    render(
      <UploadStep
        error={null}
        formValues={{ marketplace: "general" }}
        imageFile={null}
        previewUrl={null}
        step="upload"
        onFileSelected={vi.fn()}
        onRemoveFile={vi.fn()}
        onFormChange={vi.fn()}
        onGenerate={vi.fn()}
        onGoToDetails={vi.fn()}
        onGoToPhoto={vi.fn()}
      />,
    );

    expect(screen.getByText(/JPG, PNG, atau WebP maks. 3 MB/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Gemini/i)).toBeInTheDocument();
    expect(screen.getByText(/tidak disimpan secara permanen oleh Listify/i)).toBeInTheDocument();
  });

  it("keeps generation errors outside the hidden mobile photo panel", () => {
    render(
      <UploadStep
        error="Generasi gagal"
        formValues={{ marketplace: "general" }}
        imageFile={new File(["image"], "product.png", { type: "image/png" })}
        previewUrl="blob:preview"
        step="details"
        onFileSelected={vi.fn()}
        onRemoveFile={vi.fn()}
        onFormChange={vi.fn()}
        onGenerate={vi.fn()}
        onGoToDetails={vi.fn()}
        onGoToPhoto={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert").closest(".hidden")).toBeNull();
  });
});
