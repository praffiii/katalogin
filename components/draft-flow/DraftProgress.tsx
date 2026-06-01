type DraftStep = "upload" | "context" | "processing" | "review";

type DraftProgressProps = {
  step: DraftStep;
};

const steps: Array<{ id: DraftStep; label: string }> = [
  { id: "upload", label: "Upload foto" },
  { id: "context", label: "Konteks" },
  { id: "processing", label: "Proses" },
  { id: "review", label: "Review" },
];

export function DraftProgress({ step }: DraftProgressProps) {
  const activeIndex = steps.findIndex((item) => item.id === step);

  return (
    <ol className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted">
      {steps.map((item, index) => {
        const isActive = item.id === step;
        const isDone = index < activeIndex;

        return (
          <li key={item.id} className="flex min-w-0 flex-col gap-2">
            <span
              className={`h-1.5 rounded-full ${
                isActive || isDone ? "bg-primary" : "bg-surface-raised"
              }`}
            />
            <span className={`truncate ${isActive ? "text-primary" : ""}`}>
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
