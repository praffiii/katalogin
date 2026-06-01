"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CopyButtonProps = {
  text: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function CopyButton({ text, children, variant = "primary" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button type="button" variant={variant} onClick={handleCopy}>
      {copied ? "Tersalin" : children}
    </Button>
  );
}
