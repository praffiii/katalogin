import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Listify — AI Pembuat Listing Shopee & Tokopedia (Gratis)",
  description: "Upload foto produk, langsung dapat judul SEO, deskripsi menjual, estimasi harga, dan keyword marketplace. Dibuat khusus untuk penjual UMKM Indonesia.",
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
