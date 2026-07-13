import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Listify — Draft Listing Marketplace dengan AI",
  description:
    "Buat dan edit draft judul, deskripsi, kata kunci, kategori, dan panduan harga marketplace dari foto produk untuk penjual UMKM Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
