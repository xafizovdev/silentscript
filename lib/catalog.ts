export type Locale = "uz" | "en" | "ru";
export type LocalizedText = Record<Locale, string>;
export type ProductCategory = "cover" | "notebook" | "set";
export type PageType = "lined" | "dotted" | "grid" | "blank";

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
  badge?: LocalizedText;
  colors: CatalogColor[];
  supportsInsert: boolean;
  insertPrice?: number;
  insertPages?: number;
  pages?: number;
  pageType?: PageType;
  giftBoxPrice?: number;
};

export type Catalog = {
  version: number;
  updatedAt: string;
  products: CatalogProduct[];
};

export type CartConfiguration = {
  colorId: string;
  includeNotebook: boolean;
  pageType: PageType;
  initial: string;
  giftBox: boolean;
};

export type CartItem = {
  key: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  configuration: CartConfiguration;
};

export function formatPrice(value: number, currency: string): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${currency}`;
}

export function normalizeInitial(value: string): string {
  const letter = Array.from(value.normalize("NFC").replace(/[^\p{L}]/gu, ""))[0] ?? "";
  return letter.toUpperCase();
}

export function productPrice(product: CatalogProduct, configuration: CartConfiguration): number {
  return (
    product.basePrice +
    (product.supportsInsert && configuration.includeNotebook ? product.insertPrice ?? 0 : 0) +
    (configuration.initial ? 15000 : 0) +
    (configuration.giftBox ? product.giftBoxPrice ?? 0 : 0)
  );
}

export function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Catalog>;
  return (
    typeof candidate.version === "number" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.products) &&
    candidate.products.every((product) => {
      if (!product || typeof product !== "object") return false;
      const item = product as Partial<CatalogProduct>;
      return (
        typeof item.id === "string" &&
        (item.category === "cover" || item.category === "notebook" || item.category === "set") &&
        typeof item.active === "boolean" &&
        typeof item.basePrice === "number" &&
        typeof item.image === "string" &&
        Array.isArray(item.colors)
      );
    })
  );
}
