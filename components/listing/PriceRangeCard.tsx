import type { ListingResult } from "@/types/listing";

type PriceRangeCardProps = {
  priceEstimate: ListingResult["priceEstimate"];
};

const confidenceLabels: Record<
  ListingResult["priceEstimate"]["confidence"],
  string
> = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
};

function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PriceRangeCard({ priceEstimate }: PriceRangeCardProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-ink">Panduan harga</h3>
      <p className="mt-2 text-lg font-bold leading-snug text-primary">
        {formatIdr(priceEstimate.min)} - {formatIdr(priceEstimate.max)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {priceEstimate.rationale}
      </p>
      <p className="mt-2 text-xs font-semibold text-muted">
        Keyakinan: {confidenceLabels[priceEstimate.confidence]}
      </p>
    </section>
  );
}
