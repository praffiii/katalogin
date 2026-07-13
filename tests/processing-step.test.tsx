import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProcessingStep } from "@/components/draft-flow/ProcessingStep";

describe("ProcessingStep", () => {
  it("announces honest indeterminate processing state", () => {
    render(<ProcessingStep onCancel={vi.fn()} />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(/proses berjalan/i)).toBeInTheDocument();
  });
});
