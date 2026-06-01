"use client";

import { useReducer } from "react";
import { DraftProgress } from "@/components/draft-flow/DraftProgress";
import { ProcessingStep } from "@/components/draft-flow/ProcessingStep";
import { ReviewStep } from "@/components/draft-flow/ReviewStep";
import { UploadStep } from "@/components/draft-flow/UploadStep";
import { fileToBase64, validateImageFile } from "@/lib/image";
import type {
  GenerateListingRequest,
  GenerateListingResponse,
  ListingResult,
} from "@/types/listing";

type DraftStep = "upload" | "context" | "processing" | "review";
type FormValues = Omit<GenerateListingRequest, "imageBase64" | "mimeType">;

type DraftState = {
  step: DraftStep;
  imageFile: File | null;
  previewUrl: string | null;
  formValues: FormValues;
  result: ListingResult | null;
  error: string | null;
};

type DraftAction =
  | { type: "setFile"; file: File; previewUrl: string }
  | { type: "removeFile" }
  | { type: "setForm"; values: Partial<FormValues> }
  | { type: "startProcessing" }
  | { type: "setResult"; result: ListingResult }
  | { type: "setError"; error: string }
  | { type: "reset" };

const initialState: DraftState = {
  step: "upload",
  imageFile: null,
  previewUrl: null,
  formValues: {
    marketplace: "general",
  },
  result: null,
  error: null,
};

function reducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "setFile":
      return {
        ...state,
        step: "context",
        imageFile: action.file,
        previewUrl: action.previewUrl,
        error: null,
      };
    case "removeFile":
      return {
        ...state,
        step: "upload",
        imageFile: null,
        previewUrl: null,
        result: null,
        error: null,
      };
    case "setForm":
      return {
        ...state,
        formValues: {
          ...state.formValues,
          ...action.values,
        },
      };
    case "startProcessing":
      return {
        ...state,
        step: "processing",
        result: null,
        error: null,
      };
    case "setResult":
      return {
        ...state,
        step: "review",
        result: action.result,
        error: null,
      };
    case "setError":
      return {
        ...state,
        step: state.imageFile ? "context" : "upload",
        result: null,
        error: action.error,
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function DraftFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  function revokePreview() {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
  }

  function handleFileSelected(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      dispatch({ type: "setError", error: validationError });
      return;
    }

    revokePreview();
    dispatch({ type: "setFile", file, previewUrl: URL.createObjectURL(file) });
  }

  function handleRemoveFile() {
    revokePreview();
    dispatch({ type: "removeFile" });
  }

  async function handleGenerate() {
    if (!state.imageFile) {
      dispatch({
        type: "setError",
        error: "Pilih foto produk terlebih dahulu.",
      });
      return;
    }

    dispatch({ type: "startProcessing" });

    try {
      const imageBase64 = await fileToBase64(state.imageFile);
      const response = await fetch("/api/generate-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...state.formValues,
          imageBase64,
          mimeType: state.imageFile.type,
        }),
      });
      const payload = (await response.json()) as GenerateListingResponse;

      if (!payload.ok) {
        dispatch({ type: "setError", error: payload.error.message });
        return;
      }

      dispatch({ type: "setResult", result: payload.data });
    } catch {
      dispatch({
        type: "setError",
        error: "Terjadi kendala. Coba lagi dalam beberapa saat.",
      });
    }
  }

  function handleReset() {
    revokePreview();
    dispatch({ type: "reset" });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-ink sm:px-6 lg:px-8 lg:py-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Katalogin</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight tracking-normal text-balance">
              Foto produk jadi draft listing.
            </h1>
            <p className="mt-2 max-w-[65ch] text-base leading-7 text-muted text-pretty">
              Buat judul, deskripsi, keyword, dan panduan harga dalam bahasa
              Indonesia.
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted sm:max-w-64 sm:text-right">
            Tidak ada database atau penyimpanan foto.
          </p>
        </header>

        <DraftProgress hasPhoto={Boolean(state.imageFile)} step={state.step} />

        {state.step === "processing" ? (
          <ProcessingStep />
        ) : state.step === "review" && state.result ? (
          <ReviewStep
            result={state.result}
            onRegenerate={handleGenerate}
            onReset={handleReset}
          />
        ) : (
          <UploadStep
            error={state.error}
            formValues={state.formValues}
            imageFile={state.imageFile}
            previewUrl={state.previewUrl}
            onFileSelected={handleFileSelected}
            onFormChange={(values) => dispatch({ type: "setForm", values })}
            onGenerate={handleGenerate}
            onRemoveFile={handleRemoveFile}
          />
        )}
      </section>
    </main>
  );
}
