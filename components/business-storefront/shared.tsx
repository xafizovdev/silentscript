import type { CSSProperties } from "react";
import type { CatalogProduct } from "@/lib/catalog";

export type Locale = "uz" | "ru";
export type Paper = "cream" | "lined" | "dotted";
export type CartLine = {
  key: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  leatherName: string;
  leatherHex: string;
  threadName: string;
  threadHex: string;
  paper: Paper;
};
export type Customer = { name: string; phone: string; city: string; address: string; comment: string };

export const threadOptions = [
  { id: "honey", uz: "Asal", ru: "Медовая", hex: "#d59a3a" },
  { id: "cream", uz: "Krem", ru: "Кремовая", hex: "#e0dbd0" },
  { id: "charcoal", uz: "Grafit", ru: "Графитовая", hex: "#2f3130" },
  { id: "brown", uz: "Jigarrang", ru: "Коричневая", hex: "#6b4127" },
  { id: "forest", uz: "To‘q yashil", ru: "Тёмно-зелёная", hex: "#315042" },
  { id: "burgundy", uz: "Bordo", ru: "Бордовая", hex: "#7b2938" },
  { id: "navy", uz: "To‘q ko‘k", ru: "Тёмно-синяя", hex: "#263c54" },
  { id: "red", uz: "Qizil", ru: "Красная", hex: "#b72f31" },
];
export const paperOptions: Paper[] = ["cream", "lined", "dotted"];

export function formatUzs(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;
}
export function displayName(product: CatalogProduct, locale: Locale): string { return product.name[locale] || product.name.uz; }
export function modelSize(product: CatalogProduct): string {
  return /passport/i.test(product.id) || /passport/i.test(product.name.en) ? "Passport" : product.size;
}
export function isCustom(product: CatalogProduct, index: number): boolean { return product.id.startsWith("custom-") || index >= 3; }

export function CartIcon({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="19" r="1.25" fill="currentColor"/><circle cx="17" cy="19" r="1.25" fill="currentColor"/></svg>;
}
export function MenuIcon() {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}
export function NotebookVisual({ color, large = false, passport = false }: { color: string; large?: boolean; passport?: boolean }) {
  return <div className={`ex-notebook${large ? " ex-notebook--large" : ""}${passport ? " ex-notebook--passport" : ""}`} style={{ "--cover": color } as CSSProperties} aria-hidden="true"><span className="ex-notebook__spine"/><span className="ex-notebook__strap"/><span className="ex-notebook__edge"/><span className="ex-notebook__stitch"/></div>;
}
export function SideVisual({ color, thread }: { color: string; thread: string }) {
  return <div className="ex-side" style={{ "--cover": color, "--thread": thread } as CSSProperties} aria-hidden="true"><i/><i/><i/><i/><span/></div>;
}
export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="ex-heading"><p>{eyebrow}</p><h2>{title}</h2>{text ? <span>{text}</span> : null}</div>;
}
