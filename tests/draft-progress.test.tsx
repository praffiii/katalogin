import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DraftProgress } from "@/components/draft-flow/DraftProgress";

describe("DraftProgress", () => {
  it("uses Upload, Konteks, Proses, and Review as truthful stages", () => {
    render(<DraftProgress hasPhoto step="processing" />);

    expect(screen.getByLabelText("Upload")).toBeInTheDocument();
    expect(screen.getByLabelText("Konteks")).toBeInTheDocument();
    expect(screen.getByLabelText("Proses")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByLabelText("Review")).toBeInTheDocument();
  });
});
