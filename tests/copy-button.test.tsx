import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/listing/CopyButton";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CopyButton", () => {
  it("announces clipboard success while preserving the action label", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    render(<CopyButton text="draft">Salin judul</CopyButton>);

    await user.click(screen.getByRole("button", { name: "Salin judul" }));

    expect(screen.getByRole("status")).toHaveTextContent("Tersalin");
    expect(screen.getByRole("button", { name: "Salin judul" })).toBeInTheDocument();
  });

  it("announces clipboard failures without an unhandled rejection", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });
    render(<CopyButton text="draft">Salin judul</CopyButton>);

    await user.click(screen.getByRole("button", { name: "Salin judul" }));

    expect(screen.getByRole("status")).toHaveTextContent("Gagal menyalin");
  });
});
