import { ListingResultEditor } from "@/components/listing/ListingResultEditor";
import type { ListingResult } from "@/types/listing";

type ReviewStepProps = {
  result: ListingResult;
  onRegenerate: () => void;
  onReset: () => void;
};

export function ReviewStep({ result, onRegenerate, onReset }: ReviewStepProps) {
  return <ListingResultEditor result={result} onRegenerate={onRegenerate} onReset={onReset} />;
}
