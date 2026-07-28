export type Locale = "uz" | "en" | "ru";
export type ProductCategory = "cover" | "notebook" | "set";
export type PageStyle = "lined" | "grid" | "dotted" | "blank";
export type LocalizedText = Record<Locale, string>;

export type CatalogColor = {
  id: string;
  name: LocalizedText;
  hex: string;
};

export type CatalogProduct = {
  id: string;
  category: ProductCategory;
  active: boolean;
  featured?: boolean;
  name: LocalizedText;
  description: LocalizedText;
  basePrice: number;
  image: string;
  size: "A5" | "A6";
  colors: CatalogColor[];
  supportsInsert: boolean;
  insertPrice?: number;
  insertPages?: number;
  pages?: number;
  giftBoxPrice?: number;
};

export type Catalog = {
  version: number;
  updatedAt: string;
  products: CatalogProduct[];
};

const locales: Locale[] = ["uz", "en", "ru"];
const categories: ProductCategory[] = ["cover", "notebook", "set"];

function isLocalizedText(value: unknown): value is LocalizedText {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return locales.every((locale) => typeof item[locale] === "string");
}

function isColor(value: unknown): value is CatalogColor {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CatalogColor>;
  return typeof item.id === "string" && isLocalizedText(item.name) && typeof item.hex === "string";
}

function isProduct(value: unknown): value is CatalogProduct {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CatalogProduct>;
  return (
    typeof item.id === "string" &&
    categories.includes(item.category as ProductCategory) &&
    typeof item.active === "boolean" &&
    isLocalizedText(item.name) &&
    isLocalizedText(item.description) &&
    typeof item.basePrice === "number" &&
    Number.isFinite(item.basePrice) &&
    typeof item.image === "string" &&
    (item.size === "A5" || item.size === "A6") &&
    Array.isArray(item.colors) &&
    item.colors.length > 0 &&
    item.colors.every(isColor) &&
    typeof item.supportsInsert === "boolean"
  );
}

export function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Catalog>;
  return (
    typeof item.version === "number" &&
    Number.isFinite(item.version) &&
    typeof item.updatedAt === "string" &&
    Array.isArray(item.products) &&
    item.products.every(isProduct)
  );
}

export function formatPrice(value: number, currency: string): string {
  const amount = Math.max(0, Math.round(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount} ${currency}`;
}
