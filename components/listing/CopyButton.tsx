import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type CopyButtonProps = {
  text: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

type CopyStatus = "idle" | "success" | "error";

export function CopyButton({
  text,
  children,
  variant = "primary",
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<number | null>(null);

  function clearStatusTimer() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => clearStatusTimer, []);

  async function handleCopy() {
    clearStatusTimer();

    try {
      await navigator.clipboard.writeText(text);
      setStatus("success");
    } catch {
      setStatus("error");
    }

    timeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
      timeoutRef.current = null;
    }, 1800);
  }

  const message =
    status === "success"
      ? "Tersalin."
      : status === "error"
        ? "Gagal menyalin. Salin teks secara manual."
        : "";

  return (
    <>
      <Button type="button" variant={variant} onClick={handleCopy}>
        {children}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </>
  );
}
