export class GenerationTimeoutError extends Error {
  constructor() {
    super("AI_TIMEOUT");
    this.name = "GenerationTimeoutError";
  }
}

export function createRequestDeadline(
  parentSignal: AbortSignal,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new GenerationTimeoutError()),
    timeoutMs,
  );
  const handleParentAbort = () => controller.abort(parentSignal.reason);

  if (parentSignal.aborted) {
    handleParentAbort();
  } else {
    parentSignal.addEventListener("abort", handleParentAbort, { once: true });
  }

  return {
    signal: controller.signal,
    dispose() {
      clearTimeout(timeout);
      parentSignal.removeEventListener("abort", handleParentAbort);
    },
  };
}
