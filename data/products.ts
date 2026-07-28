import type { Locale } from "@/data/site-copy";

export type LocalizedText = Record<Locale, string>;

export type Product = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  pages: number;
  pageType: LocalizedText;
  size: "A5" | "A6";
  cover: string;
  accent: string;
  badge?: LocalizedText;
  ribbon?: boolean;
  gift?: boolean;
};

export const products: Product[] = [
  {
    id: "classic-note-a5",
    name: { uz: "Classic Note A5", en: "Classic Note A5", ru: "Classic Note A5" },
    description: {
      uz: "Kundalik qaydlar, dars va yangi g‘oyalar uchun sokin, universal bloknot.",
      en: "A calm, versatile notebook for daily notes, study and new ideas.",
      ru: "Спокойный универсальный блокнот для ежедневных записей, учёбы и новых идей.",
    },
    price: 129000,
    pages: 128,
    pageType: { uz: "Chiziqli", en: "Lined", ru: "Линейка" },
    size: "A5",
    cover: "#9ca57a",
    accent: "#5d6444",
    badge: { uz: "Bestseller", en: "Bestseller", ru: "Бестселлер" },
  },
  {
    id: "daily-journal-a5",
    name: { uz: "Daily Journal A5", en: "Daily Journal A5", ru: "Daily Journal A5" },
    description: {
      uz: "Kun rejalari, refleksiya va muhim odatlarni yozib borish uchun.",
      en: "For daily plans, reflection and keeping track of meaningful habits.",
      ru: "Для планов на день, рефлексии и отслеживания важных привычек.",
    },
    price: 149000,
    pages: 160,
    pageType: { uz: "Chiziqli", en: "Lined", ru: "Линейка" },
    size: "A5",
    cover: "#735846",
    accent: "#c9b99d",
    ribbon: true,
  },
  {
    id: "dot-grid-notebook",
    name: { uz: "Dot Grid Notebook", en: "Dot Grid Notebook", ru: "Dot Grid Notebook" },
    description: {
      uz: "Bullet journal, diagramma va erkin rejalashtirish uchun nuqtali sahifalar.",
      en: "Dotted pages for bullet journaling, diagrams and flexible planning.",
      ru: "Страницы в точку для bullet journal, схем и свободного планирования.",
    },
    price: 139000,
    pages: 160,
    pageType: { uz: "Nuqtali", en: "Dotted", ru: "Точки" },
    size: "A5",
    cover: "#d8cdbc",
    accent: "#a89980",
  },
  {
    id: "planner-edition",
    name: { uz: "Planner Edition", en: "Planner Edition", ru: "Planner Edition" },
    description: {
      uz: "Haftalik maqsadlar va vazifalarni aniq tizimga soladigan planner.",
      en: "A planner that gives weekly goals and tasks a clear structure.",
      ru: "Планер, который помогает системно организовать цели и задачи на неделю.",
    },
    price: 159000,
    pages: 192,
    pageType: { uz: "Planner", en: "Planner", ru: "Планер" },
    size: "A5",
    cover: "#3f5144",
    accent: "#182b21",
    badge: { uz: "Yangi", en: "New", ru: "Новинка" },
    ribbon: true,
  },
  {
    id: "pocket-note-a6",
    name: { uz: "Pocket Note A6", en: "Pocket Note A6", ru: "Pocket Note A6" },
    description: {
      uz: "Har doim yoningizda olib yurish uchun ixcham va yengil format.",
      en: "A compact, lightweight format made to stay with you everywhere.",
      ru: "Компактный и лёгкий формат, который удобно всегда носить с собой.",
    },
    price: 99000,
    pages: 96,
    pageType: { uz: "Chiziqli", en: "Lined", ru: "Линейка" },
    size: "A6",
    cover: "#c9bda9",
    accent: "#8f806a",
  },
  {
    id: "gift-box-set",
    name: { uz: "Gift Box Set", en: "Gift Box Set", ru: "Gift Box Set" },
    description: {
      uz: "Bloknot, premium ruchka va sokin qadoqdan iborat tayyor sovg‘a to‘plami.",
      en: "A ready-to-gift set with a notebook, premium pen and calm packaging.",
      ru: "Готовый подарочный набор с блокнотом, премиальной ручкой и стильной упаковкой.",
    },
    price: 189000,
    pages: 128,
    pageType: { uz: "Chiziqli", en: "Lined", ru: "Линейка" },
    size: "A5",
    cover: "#87906a",
    accent: "#2f3b2f",
    badge: { uz: "Sovg‘a", en: "Gift", ru: "Подарок" },
    gift: true,
  },
];

export const coverColors: Array<{
  name: LocalizedText;
  value: string;
  accent: string;
}> = [
  { name: { uz: "Sage", en: "Sage", ru: "Шалфей" }, value: "#9ca57a", accent: "#5d6444" },
  { name: { uz: "Cocoa", en: "Cocoa", ru: "Какао" }, value: "#735846", accent: "#c9b99d" },
  { name: { uz: "Oat", en: "Oat", ru: "Овсяный" }, value: "#d8cdbc", accent: "#a89980" },
  { name: { uz: "Stone", en: "Stone", ru: "Камень" }, value: "#9a9890", accent: "#5c5b57" },
  { name: { uz: "Forest", en: "Forest", ru: "Лесной" }, value: "#3f5144", accent: "#182b21" },
];
