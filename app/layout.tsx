import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katalogin",
  description: "Pembuat draft listing untuk UMKM Indonesia",
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
