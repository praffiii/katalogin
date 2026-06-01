"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ListingResult } from "@/types/listing";

type ReviewStepProps = {
  result: ListingResult;
  onRegenerate: () => void;
  onReset: () => void;
};

export function ReviewStep({ result, onRegenerate, onReset }: ReviewStepProps) {
  const [title, setTitle] = useState(result.title);
  const [description, setDescription] = useState(result.description);
  const [sellingPoints, setSellingPoints] = useState(
    result.sellingPoints.join("\n"),
  );
  const [keywords, setKeywords] = useState(result.seoKeywords.join(", "));

  const priceRange = useMemo(() => {
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });

    return `${formatter.format(result.priceEstimate.min)} - ${formatter.format(result.priceEstimate.max)}`;
  }, [result.priceEstimate.max, result.priceEstimate.min]);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold leading-snug text-ink">
            Draft listing
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Edit sebelum disalin ke marketplace.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Judul
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Deskripsi
            <Textarea
              className="min-h-44"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Selling point
            <Textarea
              value={sellingPoints}
              onChange={(event) => setSellingPoints(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Keyword
            <Textarea
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
            />
          </label>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-semibold text-ink">Panduan harga</h3>
          <p className="mt-2 text-lg font-bold text-primary">{priceRange}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {result.priceEstimate.rationale}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-normal text-muted">
            Keyakinan: {result.priceEstimate.confidence}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-semibold text-ink">Kategori</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {result.category.recommended}
          </p>
          {result.category.alternatives.length > 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Alternatif: {result.category.alternatives.join(", ")}
            </p>
          ) : null}
        </div>

        {result.warnings.length > 0 ? (
          <Alert variant="warning">
            <span className="block font-semibold">Perlu dicek</span>
            {result.warnings.join(" ")}
          </Alert>
        ) : null}

        <div className="grid gap-2">
          <Button type="button" onClick={onRegenerate}>
            Buat ulang
          </Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            Mulai lagi
          </Button>
        </div>
      </aside>
    </section>
  );
}
