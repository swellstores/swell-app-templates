import type { Metadata } from "next";
import { SwellProvider } from "@/components/swell-provider";
import { getPublicConfig } from "@/lib/swell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swell app",
  description: "A Swell app built with vinext",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = await getPublicConfig();

  return (
    <html lang="en">
      <body>{config ? <SwellProvider config={config}>{children}</SwellProvider> : children}</body>
    </html>
  );
}
