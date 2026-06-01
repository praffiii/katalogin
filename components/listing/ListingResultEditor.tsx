"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/listing/CopyButton";
import { PriceRangeCard } from "@/components/listing/PriceRangeCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ListingResult } from "@/types/listing";

type ListingResultEditorProps = {
  result: ListingResult;
  onRegenerate: () => void;
  onReset: () => void;
};

function normalizeLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ListingResultEditor({ result, onRegenerate, onReset }: ListingResultEditorProps) {
  const [title, setTitle] = useState(result.title);
  const [description, setDescription] = useState(result.description);
  const [sellingPoints, setSellingPoints] = useState(result.sellingPoints.join("\n"));
  const [keywords, setKeywords] = useState(result.seoKeywords.join(", "));

  const marketplaceCopy = useMemo(() => {
    const points = normalizeLines(sellingPoints)
      .map((point) => `- ${point}`)
      .join("\n");

    return [
      title,
      "",
      description,
      "",
      points ? `Keunggulan:\n${points}` : "",
      "",
      keywords ? `Keyword: ${keywords}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [description, keywords, sellingPoints, title]);

  const summaryCopy = useMemo(() => {
    const warnings = result.warnings.length > 0 ? `Peringatan: ${result.warnings.join(" ")}` : "";
    const alternatives =
      result.category.alternatives.length > 0 ? `Alternatif: ${result.category.alternatives.join(", ")}` : "";

    return [
      marketplaceCopy,
      "",
      `Kategori: ${result.category.recommended}`,
      alternatives,
      `Panduan harga: ${result.priceEstimate.min} - ${result.priceEstimate.max} IDR`,
      `Catatan harga: ${result.priceEstimate.rationale}`,
      warnings,
    ]
      .filter(Boolean)
      .join("\n");
  }, [marketplaceCopy, result.category, result.priceEstimate, result.warnings]);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <div className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold leading-snug text-ink">Draft listing</h2>
          <p className="mt-1 max-w-[65ch] text-sm leading-relaxed text-muted">Edit sebelum disalin ke marketplace.</p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Judul
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Deskripsi
            <Textarea className="min-h-44" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Selling point
            <Textarea value={sellingPoints} onChange={(event) => setSellingPoints(event.target.value)} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-ink">
            Keyword
            <Textarea value={keywords} onChange={(event) => setKeywords(event.target.value)} />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <CopyButton text={marketplaceCopy}>
              Salin untuk marketplace
            </CopyButton>
            <CopyButton text={summaryCopy} variant="secondary">
              Salin draft lengkap
            </CopyButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <PriceRangeCard priceEstimate={result.priceEstimate} />

        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-semibold text-ink">Kategori</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink">{result.category.recommended}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-muted">
            {result.category.marketplace}
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
