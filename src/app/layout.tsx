import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "properties searcher",
  description: "Search properties for sale and rent in Portugal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
