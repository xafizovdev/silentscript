import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./storefront-1.css";
import "./storefront-2.css";
import "./storefront-3.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://silentscript.vercel.app"),
  title: {
    default: "silent script. — Qo‘lda yaratilgan charm kundaliklar",
    template: "%s | silent script.",
  },
  description:
    "Qo‘lda tayyorlangan charm kundaliklar, almashtiriladigan refill bloknotlar va shaxsiylashtirilgan sovg‘a variantlari. Telegram orqali buyurtma bering.",
  keywords: [
    "charm kundalik",
    "charm bloknot",
    "journal Uzbekistan",
    "personalized notebook",
    "silent script",
    "Namangan",
    "sovg‘a",
  ],
  openGraph: {
    title: "silent script.",
    description: "Qo‘lda yaratilgan charm kundaliklar va shaxsiylashtirilgan bloknotlar.",
    url: "https://silentscript.vercel.app",
    siteName: "silent script.",
    images: [{ url: "/og-preview.svg", width: 1024, height: 1536, alt: "silent script. charm kundaliklar" }],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "silent script.",
    description: "Qo‘lda yaratilgan charm kundaliklar.",
    images: ["/og-preview.svg"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="theme-color" content="#394433" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
