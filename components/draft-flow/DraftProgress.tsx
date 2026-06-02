import { CheckIcon } from "@phosphor-icons/react";

type DraftStep = "upload" | "context" | "processing" | "review";

type DraftProgressProps = {
  hasPhoto: boolean;
  step: DraftStep;
};

const steps: Array<{ id: DraftStep; label: string }> = [
  { id: "upload", label: "Upload foto" },
  { id: "context", label: "Konteks produk" },
  { id: "processing", label: "Proses draft" },
  { id: "review", label: "Review & salin" },
];

const progressByStep: Record<DraftStep, number> = {
  upload: 0,
  context: 33.33,
  processing: 66.66,
  review: 100,
};

export function DraftProgress({ hasPhoto, step }: DraftProgressProps) {
  const activeIndex = steps.findIndex((item) => item.id === step);

  return (
    <nav aria-label="Progress draft listing">
      <ol className="grid grid-cols-4 text-xs font-semibold text-muted">
        {steps.map((item, index) => {
          const isActive = item.id === step;
          const isDone =
            index < activeIndex || (item.id === "upload" && hasPhoto);

          return (
            <li
              key={item.id}
              aria-label={item.label}
              className={`min-w-0 border-b-2 px-1 py-2 transition-colors sm:px-2 ${
                isActive
                  ? "border-primary text-primary"
                  : isDone
                    ? "border-primary-soft text-primary"
                    : "border-transparent text-muted"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="flex items-center justify-center gap-2 sm:justify-start">
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-primary text-white"
                      : isActive
                        ? "pulse-progress border border-primary bg-white text-primary"
                        : "bg-transparent text-muted"
                  }`}
                >
                  {isDone ? (
                    <CheckIcon aria-hidden="true" size={16} weight="bold" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden truncate sm:block">{item.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div
        className="sr-only"
        aria-label={`Progress ${step === "upload" && !hasPhoto ? 0 : progressByStep[step]} persen`}
      />
    </nav>
  );
}
