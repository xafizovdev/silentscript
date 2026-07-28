"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/data/site-copy";

const copy: Record<Locale, { title: string; description: string; back: string }> = {
  uz: {
    title: "Bu sahifa jim qolibdi.",
    description: "Qidirgan sahifangiz topilmadi.",
    back: "Bosh sahifaga qaytish",
  },
  en: {
    title: "This page went quiet.",
    description: "The page you were looking for could not be found.",
    back: "Return home",
  },
  ru: {
    title: "Эта страница замолчала.",
    description: "Страница, которую вы искали, не найдена.",
    back: "Вернуться на главную",
  },
};

export default function NotFound() {
  const [locale, setLocale] = useState<Locale>("uz");

  useEffect(() => {
    const stored = localStorage.getItem("silent-script-locale");
    if (stored === "uz" || stored === "en" || stored === "ru") setLocale(stored);
  }, []);

  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>{copy[locale].title}</h1>
      <p>{copy[locale].description}</p>
      <Link className="button button--primary" href="/">
        {copy[locale].back}
      </Link>
    </main>
  );
}
