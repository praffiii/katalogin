type DraftStep = "upload" | "context" | "processing" | "review";

type DraftProgressProps = {
  hasPhoto: boolean;
  step: DraftStep;
};

const steps: Array<{ id: DraftStep; label: string }> = [
  { id: "upload", label: "Upload foto" },
  { id: "context", label: "Konteks" },
  { id: "processing", label: "Proses" },
  { id: "review", label: "Review" },
];

const progressByStep: Record<DraftStep, number> = {
  upload: 0,
  context: 33.33,
  processing: 66.66,
  review: 100,
};

export function DraftProgress({ hasPhoto, step }: DraftProgressProps) {
  const activeIndex = steps.findIndex((item) => item.id === step);
  const progress = step === "upload" && !hasPhoto ? 0 : progressByStep[step];

  return (
    <nav aria-label="Progress draft listing" className="py-1">
      <div className="relative mx-1 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-raised" />
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary transition-[width]"
          style={{ width: `${progress}%` }}
        />
        <ol className="relative grid grid-cols-4">
          {steps.map((item, index) => {
            const isActive = item.id === step;
            const isDone = index < activeIndex || (item.id === "upload" && hasPhoto);

            return (
              <li
                key={item.id}
                className={`flex ${
                  index === 0
                    ? "justify-start"
                    : index === steps.length - 1
                      ? "justify-end"
                      : "justify-center"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-5 w-5 rounded-full border-2 ${
                    isDone
                      ? "border-primary bg-primary"
                      : isActive
                        ? "border-primary bg-white"
                        : "border-surface-raised bg-white"
                  }`}
                />
              </li>
            );
          })}
        </ol>
      </div>
      <ol className="mt-2 grid grid-cols-4 text-xs font-semibold text-muted">
        {steps.map((item, index) => {
          const isActive = item.id === step;
          const isDone = index < activeIndex || (item.id === "upload" && hasPhoto);

          return (
            <li
              key={item.id}
              className={`min-w-0 ${
                index === 0
                  ? "text-left"
                  : index === steps.length - 1
                    ? "text-right"
                    : "text-center"
              } ${isActive || isDone ? "text-primary" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="block truncate">{item.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
