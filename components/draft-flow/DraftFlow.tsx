"use client";

import { useReducer, useRef } from "react";
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

type DraftStep = "upload" | "photo" | "details" | "processing" | "review";
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
  | { type: "goToPhoto" }
  | { type: "goToDetails" }
  | { type: "startProcessing" }
  | { type: "cancelProcessing" }
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
        step: "photo",
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
    case "goToPhoto":
      return {
        ...state,
        step: state.imageFile ? "photo" : "upload",
        error: null,
      };
    case "goToDetails":
      return {
        ...state,
        step: state.imageFile ? "details" : "upload",
        error: null,
      };
    case "startProcessing":
      return {
        ...state,
        step: "processing",
        result: null,
        error: null,
      };
    case "cancelProcessing":
      return {
        ...state,
        step: state.imageFile ? "details" : "upload",
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
        step: state.imageFile ? "details" : "upload",
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
  const generationAbortRef = useRef<AbortController | null>(null);
  const uploadStep =
    state.step === "photo" || state.step === "details" ? state.step : "upload";

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

    generationAbortRef.current?.abort();

    const abortController = new AbortController();
    generationAbortRef.current = abortController;

    dispatch({ type: "startProcessing" });

    try {
      const imageBase64 = await fileToBase64(state.imageFile);

      if (abortController.signal.aborted) {
        return;
      }

      const response = await fetch("/api/generate-listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: JSON.stringify({
          ...state.formValues,
          imageBase64,
          mimeType: state.imageFile.type,
        }),
      });
      const payload = (await response.json()) as GenerateListingResponse;

      if (abortController.signal.aborted) {
        return;
      }

      if (!payload.ok) {
        dispatch({ type: "setError", error: payload.error.message });
        return;
      }

      dispatch({ type: "setResult", result: payload.data });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      dispatch({
        type: "setError",
        error: "Terjadi kendala. Coba lagi dalam beberapa saat.",
      });
    } finally {
      if (generationAbortRef.current === abortController) {
        generationAbortRef.current = null;
      }
    }
  }

  function handleCancelGenerate() {
    generationAbortRef.current?.abort();
    generationAbortRef.current = null;
    dispatch({ type: "cancelProcessing" });
  }

  function handleReset() {
    generationAbortRef.current?.abort();
    generationAbortRef.current = null;
    revokePreview();
    dispatch({ type: "reset" });
  }

  return (
    <main className="builder-shell min-h-screen px-3 py-3 text-ink sm:px-6 sm:py-6 lg:px-8">
      <section className="surface-enter mx-auto flex w-full max-w-7xl flex-col overflow-hidden bg-white">
        <header className="flex flex-col gap-4 border-b border-border px-1 py-4 sm:px-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col">
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight text-primary">
                  Katalogin
                </p>
                <h1 className="mt-1 text-lg font-semibold leading-snug text-ink text-balance sm:text-lg">
                  Susun draft listing dari satu foto produk.
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-border py-3">
          <DraftProgress hasPhoto={Boolean(state.imageFile)} step={state.step} />
        </div>

        <div className="py-4 lg:py-6">
          {state.step === "processing" ? (
            <ProcessingStep onCancel={handleCancelGenerate} />
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
              step={uploadStep}
              onFileSelected={handleFileSelected}
              onFormChange={(values) => dispatch({ type: "setForm", values })}
              onGenerate={handleGenerate}
              onGoToDetails={() => dispatch({ type: "goToDetails" })}
              onGoToPhoto={() => dispatch({ type: "goToPhoto" })}
              onRemoveFile={handleRemoveFile}
            />
          )}
        </div>
      </section>
    </main>
  );
}
