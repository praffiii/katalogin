import { Skeleton } from "@/components/ui/Skeleton";

const messages = [
  "Menganalisis foto produk...",
  "Menyusun judul dan deskripsi...",
  "Menyiapkan keyword dan panduan...",
];

export function ProcessingStep() {
  return (
    <section className="grid gap-5 rounded-xl border border-border bg-white p-4 sm:p-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        <Skeleton className="aspect-4/3 w-full" />
        <div className="space-y-2">
          {messages.map((message) => (
            <p key={message} className="text-sm font-semibold text-muted">
              {message}
            </p>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </section>
  );
}
