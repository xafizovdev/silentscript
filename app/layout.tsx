import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://silentscript.uz"),
  title: {
    default: "silent script. — Xotirjam fikrlar uchun bloknotlar",
    template: "%s | silent script.",
  },
  description:
    "Premium bloknotlar, plannerlar va shaxsiylashtirilgan sovg‘a to‘plamlari. O‘z uslubingizni yarating va Telegram orqali buyurtma bering.",
  keywords: [
    "bloknot",
    "planner",
    "journal",
    "silent script",
    "Uzbekistan",
    "sovg‘a",
    "personalized notebook",
  ],
  openGraph: {
    title: "silent script.",
    description: "Xotirjam fikrlar uchun puxta yaratilgan bloknotlar.",
    url: "https://silentscript.uz",
    siteName: "silent script.",
    images: [
      {
        url: "/og-preview.svg",
        width: 1024,
        height: 1536,
        alt: "silent script. premium notebook store",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "silent script.",
    description: "Xotirjam fikrlar uchun puxta yaratilgan bloknotlar.",
    images: ["/og-preview.svg"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
