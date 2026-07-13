import { afterEach, describe, expect, it, vi } from "vitest";
import { GenerationTimeoutError, createRequestDeadline } from "@/lib/deadline";

afterEach(() => {
  vi.useRealTimers();
});

describe("createRequestDeadline", () => {
  it("preserves caller cancellation separately from timeout", () => {
    vi.useFakeTimers();
    const parent = new AbortController();
    const deadline = createRequestDeadline(parent.signal, 25_000);
    const reason = new DOMException("Cancelled", "AbortError");

    parent.abort(reason);

    expect(deadline.signal.reason).toBe(reason);
    vi.advanceTimersByTime(25_000);
    expect(deadline.signal.reason).toBe(reason);
    deadline.dispose();
  });

  it("aborts with a typed timeout error at the application deadline", () => {
    vi.useFakeTimers();
    const deadline = createRequestDeadline(new AbortController().signal, 25_000);

    vi.advanceTimersByTime(25_000);

    expect(deadline.signal.aborted).toBe(true);
    expect(deadline.signal.reason).toBeInstanceOf(GenerationTimeoutError);
    deadline.dispose();
  });
});
