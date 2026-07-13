import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DraftFlow } from "@/components/draft-flow/DraftFlow";

beforeEach(() => {
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DraftFlow", () => {
  it("shows API generation failures in the visible context step", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: "RATE_LIMITED", message: "Batas penggunaan tercapai." },
          }),
          { status: 429, headers: { "content-type": "application/json" } },
        ),
      ),
    );
    render(<DraftFlow />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');

    fireEvent.change(input!, {
      target: {
        files: [new File(["image"], "product.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lanjut ke detail" }));
    fireEvent.click(screen.getByRole("button", { name: "Buat draft listing" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Batas penggunaan tercapai.");
    expect(alert.closest(".hidden")).toBeNull();
  });

  it("revokes the active preview URL when the flow unmounts", () => {
    const { unmount } = render(<DraftFlow />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');

    fireEvent.change(input!, {
      target: {
        files: [new File(["image"], "product.png", { type: "image/png" })],
      },
    });
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("moves focus to the context heading after the mobile step transition", async () => {
    render(<DraftFlow />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: {
        files: [new File(["image"], "product.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lanjut ke detail" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Detail listing" }),
      ).toHaveFocus(),
    );
  });
});
