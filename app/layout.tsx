import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katalogin",
  description: "Foto produk jadi draft listing siap edit untuk penjual Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
