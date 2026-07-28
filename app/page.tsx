"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import NotebookVisual from "@/components/NotebookVisual";
import Reveal from "@/components/Reveal";
import { coverColors, products, type Product } from "@/data/products";
import {
  localeOptions,
  translations,
  type Locale,
  type PageStyle,
} from "@/data/site-copy";
import { formatPrice } from "@/lib/format";
import {
  ArrowIcon,
  BagIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  GiftIcon,
  LeafIcon,
  MenuIcon,
  MinusIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparkIcon,
  TelegramIcon,
  TrashIcon,
  UserIcon,
} from "@/components/Icons";

type CustomState = {
  size: "A5" | "A6";
  colorIndex: number;
  pages: PageStyle;
  personalization: string;
  giftBox: boolean;
};

type ProductCartItem = {
  key: string;
  kind: "product";
  productId: string;
  price: number;
  quantity: number;
};

type CustomCartItem = {
  key: string;
  kind: "custom";
  price: number;
  quantity: number;
  config: CustomState;
};

type CartItem = ProductCartItem | CustomCartItem;

type CustomerDetails = {
  name: string;
  phone: string;
  address: string;
  comment: string;
};

const CART_STORAGE_KEY = "silent-script-cart-v2";
const LOCALE_STORAGE_KEY = "silent-script-locale";
const TELEGRAM_ORDER_USERNAME = "thatswriter";
const TELEGRAM_CHANNEL_USERNAME = "silentscriptuz";
const COPYRIGHT_YEAR = 2026;
const pageStyles: PageStyle[] = ["lined", "grid", "dotted", "blank"];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function calculateCustomPrice(custom: CustomState) {
  return (
    129000 +
    (custom.size === "A6" ? -20000 : 0) +
    (custom.pages === "dotted" ? 10000 : custom.pages === "grid" ? 5000 : 0) +
    (custom.personalization.trim() ? 15000 : 0) +
    (custom.giftBox ? 25000 : 0)
  );
}

function getProduct(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

function isCart(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const entry = item as Partial<CartItem>;
    if (typeof entry.key !== "string" || typeof entry.price !== "number" || typeof entry.quantity !== "number") return false;
    if (entry.kind === "product") return typeof (entry as ProductCartItem).productId === "string";
    if (entry.kind === "custom") {
      const config = (entry as CustomCartItem).config;
      return Boolean(config && typeof config === "object" && typeof config.personalization === "string");
    }
    return false;
  });
}

function LanguageSwitcher({
  locale,
  onChange,
  mobile = false,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  mobile?: boolean;
}) {
  return (
    <div className={`language-switcher ${mobile ? "language-switcher--mobile" : ""}`} aria-label="Language / Til / Язык">
      {localeOptions.map((option) => (
        <button
          type="button"
          key={option.code}
          className={locale === option.code ? "active" : ""}
          aria-pressed={locale === option.code}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.code)}
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [localeReady, setLocaleReady] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState<CustomState>({
    size: "A5",
    colorIndex: 0,
    pages: "lined",
    personalization: "",
    giftBox: true,
  });
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
    comment: "",
  });

  const t = translations[locale];
  const activeColor = coverColors[custom.colorIndex] ?? coverColors[0];
  const customPrice = calculateCustomPrice(custom);

  useEffect(() => {
    try {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (storedLocale === "uz" || storedLocale === "en" || storedLocale === "ru") {
        setLocale(storedLocale);
      }
    } finally {
      setLocaleReady(true);
    }
  }, []);

  useEffect(() => {
    if (!localeReady) return;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.title = translations[locale].meta.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = translations[locale].meta.description;
  }, [locale, localeReady]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsed: unknown = JSON.parse(storedCart);
        if (isCart(parsed)) setCart(parsed.filter((item) => item.quantity > 0));
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  const overlayOpen = Boolean(cartOpen || selectedProduct || orderOpen || mobileMenu || searchOpen);

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileMenu(false);
      setCartOpen(false);
      setSelectedProduct(null);
      setOrderOpen(false);
      setSearchOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      const text = `${product.name[locale]} ${product.description[locale]} ${product.pageType[locale]}`;
      return text.toLowerCase().includes(query);
    });
  }, [locale, search]);

  function addProduct(product: Product) {
    setCart((current) => {
      const key = `product-${product.id}`;
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...current,
        {
          key,
          kind: "product",
          productId: product.id,
          price: product.price,
          quantity: 1,
        },
      ];
    });
    setSelectedProduct(null);
    setCartOpen(true);
  }

  function addCustomNotebook() {
    const snapshot: CustomState = { ...custom };
    const key = [
      "custom",
      snapshot.size,
      snapshot.colorIndex,
      snapshot.pages,
      snapshot.personalization.trim().toLowerCase(),
      snapshot.giftBox ? "gift" : "standard",
    ].join("-");

    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...current,
        {
          key,
          kind: "custom",
          config: snapshot,
          price: calculateCustomPrice(snapshot),
          quantity: 1,
        },
      ];
    });
    setCartOpen(true);
  }

  function changeQuantity(key: string, direction: 1 | -1) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.key !== key) return [item];
        const quantity = item.quantity + direction;
        return quantity <= 0 ? [] : [{ ...item, quantity }];
      }),
    );
  }

  function cartItemDetails(item: CartItem) {
    if (item.kind === "product") {
      const product = getProduct(item.productId);
      if (!product) {
        return {
          name: "silent script.",
          meta: "",
          color: "#9ca57a",
          accent: "#5d6444",
        };
      }
      return {
        name: product.name[locale],
        meta: `${product.size} · ${product.pages} ${t.common.pagesUnit} · ${product.pageType[locale]}`,
        color: product.cover,
        accent: product.accent,
      };
    }

    const color = coverColors[item.config.colorIndex] ?? coverColors[0];
    const details = [
      item.config.size,
      color.name[locale],
      t.custom.pageTypes[item.config.pages],
      item.config.personalization.trim() ? `“${item.config.personalization.trim()}”` : null,
      item.config.giftBox ? t.cart.giftBox : null,
    ].filter(Boolean);

    return {
      name: t.custom.customName,
      meta: details.join(" · "),
      color: color.value,
      accent: color.accent,
    };
  }

  const orderText = useMemo(() => {
    if (cart.length === 0) return t.order.emptyGreeting;

    const lines = cart.map((item, index) => {
      const details = cartItemDetails(item);
      return `${index + 1}. ${details.name}\n   ${details.meta}\n   ${item.quantity} × ${formatPrice(item.price, t.common.currency)} = ${formatPrice(item.quantity * item.price, t.common.currency)}`;
    });

    const customerLines = [
      customer.name.trim() ? `${t.order.customer}: ${customer.name.trim()}` : null,
      customer.phone.trim() ? `${t.order.phoneLabel}: ${customer.phone.trim()}` : null,
      customer.address.trim() ? `${t.order.addressLabel}: ${customer.address.trim()}` : null,
      customer.comment.trim() ? `${t.order.commentLabel}: ${customer.comment.trim()}` : null,
    ].filter(Boolean);

    return `${t.order.greeting}\n\n${lines.join("\n\n")}\n\n${t.common.total}: ${formatPrice(cartTotal, t.common.currency)}${customerLines.length ? `\n\n${customerLines.join("\n")}` : ""}`;
  }, [cart, cartTotal, customer, locale, t]);

  async function copyOrder() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = orderText;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function submitTelegramOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      setOrderError(t.order.required);
      return;
    }
    setOrderError("");
    const url = `https://t.me/${TELEGRAM_ORDER_USERNAME}?text=${encodeURIComponent(orderText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale);
  }

  const navItems = [
    [t.nav.home, "top"],
    [t.nav.shop, "shop"],
    [t.nav.customize, "customize"],
    [t.nav.about, "about"],
    [t.nav.journal, "journal"],
    [t.nav.faq, "faq"],
  ] as const;

  const benefitIcons = [LeafIcon, PencilIcon, UserIcon, GiftIcon, SparkIcon];
  const journalArts = ["journal-art--desk", "journal-art--pages", "journal-art--stack", "journal-art--calm"];

  return (
    <>
      <div className="announcement-bar">{t.announcement}</div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label={`silent script. — ${t.nav.home}`}>
          silent script.
        </a>
        <nav className="desktop-nav" aria-label={t.common.menu}>
          {navItems.map(([label, id]) => (
            <button type="button" key={id} onClick={() => scrollToId(id)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSwitcher locale={locale} onChange={selectLocale} />
          <button type="button" className="icon-button" aria-label={t.common.search} onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <button
            type="button"
            className="icon-button bag-button"
            aria-label={`${t.common.bag}: ${cartCount}`}
            onClick={() => setCartOpen(true)}
          >
            <BagIcon />
            {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
          </button>
          <button
            type="button"
            className="icon-button mobile-menu-button"
            aria-label={t.common.menu}
            onClick={() => setMobileMenu(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero section-shell">
          <div className="hero-copy">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.title}</h1>
            <p className="hero-description">{t.hero.description}</p>
            <div className="hero-actions">
              <button type="button" className="button button--primary" onClick={() => scrollToId("customize")}>
                {t.hero.create} <ArrowIcon size={17} />
              </button>
              <a
                className="button button--outline"
                href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.hero.channel} <TelegramIcon size={17} />
              </a>
            </div>
            <div className="hero-proof">
              {t.hero.proof.map((item) => (
                <span key={item}>
                  <CheckIcon size={15} /> {item}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-art" aria-label="silent script. notebook">
            <span className="hero-leaf hero-leaf--one" />
            <span className="hero-leaf hero-leaf--two" />
            <div className="stone stone--back" />
            <div className="stone stone--front" />
            <NotebookVisual color="#9ca57a" accent="#596044" size="lg" rotate={-4} ribbon />
            <div className="ceramic-vase">
              <span />
            </div>
          </div>
        </section>

        <section id="shop" className="section section-shell products-section">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.products.eyebrow}</p>
                <h2>{t.products.title}</h2>
              </div>
              <button type="button" className="text-link" onClick={() => setSearchOpen(true)}>
                {t.products.all} <ArrowIcon size={17} />
              </button>
            </div>
          </Reveal>
          <div className="product-grid">
            {products.map((product, index) => (
              <Reveal key={product.id} delay={index * 55}>
                <article className="product-card">
                  <button
                    type="button"
                    className="product-visual"
                    onClick={() => setSelectedProduct(product)}
                    aria-label={`${product.name[locale]} — ${t.products.quickView}`}
                  >
                    {product.badge && <span className="product-badge">{product.badge[locale]}</span>}
                    <NotebookVisual
                      color={product.cover}
                      accent={product.accent}
                      size={product.size === "A6" ? "sm" : "md"}
                      rotate={index % 2 ? 4 : -4}
                      ribbon={product.ribbon}
                      gift={product.gift}
                    />
                    <span className="quick-view">{t.products.quickView}</span>
                  </button>
                  <div className="product-info">
                    <button type="button" className="product-name" onClick={() => setSelectedProduct(product)}>
                      {product.name[locale]}
                    </button>
                    <p>
                      {product.pages} {t.common.pagesUnit} · {product.pageType[locale]}
                    </p>
                    <div className="product-bottom">
                      <strong>{formatPrice(product.price, t.common.currency)}</strong>
                      <button
                        type="button"
                        className="add-circle"
                        onClick={() => addProduct(product)}
                        aria-label={`${product.name[locale]} — ${t.products.add}`}
                      >
                        <PlusIcon size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="benefits section-shell" aria-label={t.nav.about}>
          {t.benefits.map(([title, text], index) => {
            const Icon = benefitIcons[index] ?? SparkIcon;
            return (
              <div className="benefit" key={title}>
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            );
          })}
        </section>

        <section id="customize" className="section section-shell customizer-section">
          <Reveal className="customizer-intro">
            <p className="eyebrow">{t.custom.eyebrow}</p>
            <h2>{t.custom.title}</h2>
            <p>{t.custom.description}</p>
            <div className="customizer-note">
              <SparkIcon size={18} />
              <span>{t.custom.note}</span>
            </div>
          </Reveal>

          <Reveal className="customizer-preview" delay={80}>
            <NotebookVisual
              color={activeColor.value}
              accent={activeColor.accent}
              size={custom.size === "A6" ? "md" : "lg"}
              rotate={-2}
              ribbon
              label={custom.personalization.trim() || t.custom.defaultPersonalization}
            />
            <div className="preview-dots" aria-hidden="true">
              <span className="active" />
              <span />
              <span />
            </div>
          </Reveal>

          <Reveal className="customizer-controls" delay={150}>
            <fieldset>
              <legend>{t.custom.size}</legend>
              <div className="segmented">
                {(["A5", "A6"] as const).map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={custom.size === size ? "active" : ""}
                    aria-pressed={custom.size === size}
                    onClick={() => setCustom((current) => ({ ...current, size }))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t.custom.coverColor}</legend>
              <div className="swatches">
                {coverColors.map((color, index) => (
                  <button
                    type="button"
                    key={color.value}
                    aria-label={color.name[locale]}
                    title={color.name[locale]}
                    className={custom.colorIndex === index ? "active" : ""}
                    style={{ background: color.value }}
                    onClick={() => setCustom((current) => ({ ...current, colorIndex: index }))}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t.custom.pageType}</legend>
              <div className="page-options">
                {pageStyles.map((page) => (
                  <button
                    type="button"
                    key={page}
                    title={t.custom.pageTypes[page]}
                    aria-label={t.custom.pageTypes[page]}
                    aria-pressed={custom.pages === page}
                    className={custom.pages === page ? "active" : ""}
                    onClick={() => setCustom((current) => ({ ...current, pages: page }))}
                  >
                    <span className={`page-icon page-icon--${page}`} />
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t.custom.coverText}</legend>
              <input
                value={custom.personalization}
                maxLength={15}
                onChange={(event) => setCustom((current) => ({ ...current, personalization: event.target.value }))}
                placeholder={t.custom.placeholder}
              />
              <small>
                {custom.personalization.length}/15 {t.custom.characters}
              </small>
            </fieldset>
            <fieldset>
              <legend>{t.custom.giftBox}</legend>
              <div className="segmented">
                <button
                  type="button"
                  className={!custom.giftBox ? "active" : ""}
                  aria-pressed={!custom.giftBox}
                  onClick={() => setCustom((current) => ({ ...current, giftBox: false }))}
                >
                  {t.common.no}
                </button>
                <button
                  type="button"
                  className={custom.giftBox ? "active" : ""}
                  aria-pressed={custom.giftBox}
                  onClick={() => setCustom((current) => ({ ...current, giftBox: true }))}
                >
                  {t.common.yes}
                </button>
              </div>
            </fieldset>
          </Reveal>

          <Reveal className="customizer-summary" delay={220}>
            <p className="summary-title">{t.custom.summary}</p>
            <dl>
              <div>
                <dt>{t.custom.size}</dt>
                <dd>{custom.size}</dd>
              </div>
              <div>
                <dt>{t.custom.color}</dt>
                <dd>{activeColor.name[locale]}</dd>
              </div>
              <div>
                <dt>{t.custom.pages}</dt>
                <dd>{t.custom.pageTypes[custom.pages]}</dd>
              </div>
              <div>
                <dt>{t.custom.personalization}</dt>
                <dd>{custom.personalization.trim() || t.common.no}</dd>
              </div>
              <div>
                <dt>{t.custom.giftBox}</dt>
                <dd>{custom.giftBox ? t.common.yes : t.common.no}</dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>{t.common.total}</span>
              <strong>{formatPrice(customPrice, t.common.currency)}</strong>
            </div>
            <button type="button" className="button button--primary button--full" onClick={addCustomNotebook}>
              {t.products.add} <BagIcon size={17} />
            </button>
          </Reveal>
        </section>

        <section id="about" className="section section-shell story-section">
          <Reveal className="story-card story-card--large">
            <div className="story-copy">
              <p className="eyebrow">{t.story.eyebrow}</p>
              <h2>{t.story.title}</h2>
              <p>{t.story.description}</p>
              <a
                href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {t.story.link} <ArrowIcon size={17} />
              </a>
            </div>
            <div className="story-art">
              <div className="open-pages">
                <span />
                <span />
                <i />
              </div>
              <NotebookVisual color="#6f5a48" accent="#c9b89d" size="md" rotate={7} />
            </div>
          </Reveal>
          <Reveal className="quote-card" delay={100}>
            <p>{t.story.quote}</p>
            <span>— silent script.</span>
          </Reveal>
        </section>

        <section id="journal" className="section section-shell journal-section">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t.journal.eyebrow}</p>
                <h2>{t.journal.title}</h2>
              </div>
              <a
                className="text-link"
                href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.journal.link} <ArrowIcon size={17} />
              </a>
            </div>
          </Reveal>
          <div className="journal-grid">
            {t.journal.items.map(([title, text], index) => (
              <Reveal key={title} delay={index * 70}>
                <article className="journal-card">
                  <div className={`journal-art ${journalArts[index] ?? "journal-art--desk"}`}>
                    <NotebookVisual
                      color={index % 2 ? "#d4c9b7" : "#919a70"}
                      accent="#5b6049"
                      size="sm"
                      rotate={index % 2 ? 8 : -8}
                    />
                  </div>
                  <p className="journal-number">0{index + 1}</p>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className="section section-shell faq-section">
          <Reveal className="faq-intro">
            <p className="eyebrow">{t.faq.eyebrow}</p>
            <h2>{t.faq.title}</h2>
            <p>{t.faq.description}</p>
          </Reveal>
          <Reveal className="faq-list" delay={80}>
            {t.faq.items.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question} <PlusIcon size={19} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </Reveal>
        </section>

        <section className="newsletter section-shell">
          <div>
            <p className="eyebrow">{t.newsletter.eyebrow}</p>
            <h2>{t.newsletter.title}</h2>
          </div>
          <a
            className="button button--light"
            href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.newsletter.button} <TelegramIcon size={17} />
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="section-shell footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Image src="/brand-avatar.svg" alt="silent script." width={58} height={58} />
              <span>silent script.</span>
            </div>
            <p>{t.footer.description}</p>
          </div>
          <div>
            <h3>{t.footer.shop}</h3>
            <button type="button" onClick={() => scrollToId("shop")}>
              {t.footer.allProducts}
            </button>
            <button type="button" onClick={() => scrollToId("customize")}>
              {t.footer.customize}
            </button>
            <a href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`} target="_blank" rel="noreferrer">
              {t.footer.giftSets}
            </a>
          </div>
          <div>
            <h3>{t.footer.help}</h3>
            <button type="button" onClick={() => scrollToId("faq")}>
              FAQ
            </button>
            <a href={`https://t.me/${TELEGRAM_ORDER_USERNAME}`} target="_blank" rel="noreferrer">
              {t.footer.delivery}
            </a>
            <a href={`https://t.me/${TELEGRAM_ORDER_USERNAME}`} target="_blank" rel="noreferrer">
              {t.footer.orderStatus}
            </a>
          </div>
          <div>
            <h3>{t.footer.brand}</h3>
            <button type="button" onClick={() => scrollToId("about")}>
              {t.footer.about}
            </button>
            <button type="button" onClick={() => scrollToId("journal")}>
              {t.nav.journal}
            </button>
            <a href={`https://t.me/${TELEGRAM_ORDER_USERNAME}`} target="_blank" rel="noreferrer">
              {t.footer.contact}
            </a>
          </div>
          <div>
            <h3>{t.footer.connect}</h3>
            <a className="footer-social" href={`https://t.me/${TELEGRAM_ORDER_USERNAME}`} target="_blank" rel="noreferrer">
              <TelegramIcon size={20} /> @{TELEGRAM_ORDER_USERNAME}
            </a>
            <a className="footer-social" href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`} target="_blank" rel="noreferrer">
              <TelegramIcon size={20} /> @{TELEGRAM_CHANNEL_USERNAME}
            </a>
          </div>
        </div>
        <div className="section-shell footer-bottom">
          <span>© {COPYRIGHT_YEAR} silent script.</span>
          <span>{t.footer.rights}</span>
        </div>
      </footer>

      {mobileMenu && (
        <div className="overlay" onMouseDown={() => setMobileMenu(false)}>
          <aside
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.common.menu}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <span className="wordmark">silent script.</span>
              <button type="button" className="icon-button" aria-label={t.common.close} onClick={() => setMobileMenu(false)}>
                <CloseIcon />
              </button>
            </div>
            <LanguageSwitcher locale={locale} onChange={selectLocale} mobile />
            <nav>
              {navItems.map(([label, id]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setMobileMenu(false);
                    window.setTimeout(() => scrollToId(id), 80);
                  }}
                >
                  {label} <ArrowIcon />
                </button>
              ))}
            </nav>
            <a
              className="button button--primary button--full"
              href={`https://t.me/${TELEGRAM_CHANNEL_USERNAME}`}
              target="_blank"
              rel="noreferrer"
            >
              {t.hero.channel} <TelegramIcon size={17} />
            </a>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="overlay search-overlay" onMouseDown={() => setSearchOpen(false)}>
          <div
            className="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t.common.search}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search.placeholder}
                aria-label={t.common.search}
              />
              <button type="button" className="icon-button" aria-label={t.common.close} onClick={() => setSearchOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="search-results">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => {
                      setSearchOpen(false);
                      setSelectedProduct(product);
                    }}
                  >
                    <NotebookVisual color={product.cover} accent={product.accent} size="sm" rotate={-5} />
                    <span>
                      <strong>{product.name[locale]}</strong>
                      <small>
                        {product.pageType[locale]} · {formatPrice(product.price, t.common.currency)}
                      </small>
                    </span>
                    <ArrowIcon size={18} />
                  </button>
                ))
              ) : (
                <p className="empty-state">{t.search.empty}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="overlay" onMouseDown={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t.common.bag}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <p className="eyebrow">{t.cart.eyebrow}</p>
                <h2>{t.cart.title}</h2>
              </div>
              <button type="button" className="icon-button" aria-label={t.common.close} onClick={() => setCartOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <BagIcon size={40} />
                  <h3>{t.cart.emptyTitle}</h3>
                  <p>{t.cart.emptyDescription}</p>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => {
                      setCartOpen(false);
                      window.setTimeout(() => scrollToId("shop"), 80);
                    }}
                  >
                    {t.common.backToShop}
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const details = cartItemDetails(item);
                  return (
                    <div className="cart-item" key={item.key}>
                      <div className="cart-item-art">
                        <NotebookVisual color={details.color} accent={details.accent} size="sm" rotate={-5} />
                      </div>
                      <div className="cart-item-info">
                        <h3>{details.name}</h3>
                        <p>{details.meta}</p>
                        <strong>{formatPrice(item.price, t.common.currency)}</strong>
                        <div className="quantity" aria-label={t.common.quantity}>
                          <button type="button" aria-label="−" onClick={() => changeQuantity(item.key, -1)}>
                            <MinusIcon size={15} />
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" aria-label="+" onClick={() => changeQuantity(item.key, 1)}>
                            <PlusIcon size={15} />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-button"
                        aria-label={t.common.remove}
                        onClick={() => setCart((current) => current.filter((entry) => entry.key !== item.key))}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>{t.common.total}</span>
                  <strong>{formatPrice(cartTotal, t.common.currency)}</strong>
                </div>
                <p>{t.cart.deliveryNote}</p>
                <button
                  type="button"
                  className="button button--primary button--full"
                  onClick={() => {
                    setCartOpen(false);
                    setOrderOpen(true);
                  }}
                >
                  {t.cart.checkout} <TelegramIcon size={17} />
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {selectedProduct && (
        <div className="overlay modal-overlay" onMouseDown={() => setSelectedProduct(null)}>
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="icon-button modal-close"
              aria-label={t.common.close}
              onClick={() => setSelectedProduct(null)}
            >
              <CloseIcon />
            </button>
            <div className="product-modal-art">
              <NotebookVisual
                color={selectedProduct.cover}
                accent={selectedProduct.accent}
                size="lg"
                rotate={-3}
                ribbon={selectedProduct.ribbon}
                gift={selectedProduct.gift}
              />
            </div>
            <div className="product-modal-copy">
              <p className="eyebrow">{selectedProduct.badge?.[locale] || t.productModal.collection}</p>
              <h2 id="product-modal-title">{selectedProduct.name[locale]}</h2>
              <p>{selectedProduct.description[locale]}</p>
              <ul>
                <li>
                  <CheckIcon size={16} /> {selectedProduct.pages} {t.common.pagesUnit}
                </li>
                <li>
                  <CheckIcon size={16} /> {selectedProduct.pageType[locale]} {t.productModal.format}
                </li>
                <li>
                  <CheckIcon size={16} /> {selectedProduct.size} {t.productModal.size}
                </li>
                <li>
                  <CheckIcon size={16} /> {t.productModal.paper}
                </li>
              </ul>
              <div className="modal-price">{formatPrice(selectedProduct.price, t.common.currency)}</div>
              <button type="button" className="button button--primary button--full" onClick={() => addProduct(selectedProduct)}>
                {t.products.add} <BagIcon size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {orderOpen && (
        <div className="overlay modal-overlay" onMouseDown={() => setOrderOpen(false)}>
          <form
            className="order-modal order-modal--checkout"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            onSubmit={submitTelegramOrder}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="icon-button modal-close"
              aria-label={t.common.close}
              onClick={() => setOrderOpen(false)}
            >
              <CloseIcon />
            </button>
            <div className="order-icon">
              <PackageIcon size={28} />
            </div>
            <p className="eyebrow">{t.order.eyebrow}</p>
            <h2 id="order-modal-title">{t.order.title}</h2>
            <p>{t.order.description}</p>

            <div className="checkout-fields">
              <label>
                <span>{t.order.name}</span>
                <input
                  autoFocus
                  value={customer.name}
                  autoComplete="name"
                  placeholder={t.order.namePlaceholder}
                  onChange={(event) => {
                    setCustomer((current) => ({ ...current, name: event.target.value }));
                    setOrderError("");
                  }}
                />
              </label>
              <label>
                <span>{t.order.phone}</span>
                <input
                  value={customer.phone}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t.order.phonePlaceholder}
                  onChange={(event) => {
                    setCustomer((current) => ({ ...current, phone: event.target.value }));
                    setOrderError("");
                  }}
                />
              </label>
              <label className="checkout-field--wide">
                <span>{t.order.address}</span>
                <input
                  value={customer.address}
                  autoComplete="street-address"
                  placeholder={t.order.addressPlaceholder}
                  onChange={(event) => setCustomer((current) => ({ ...current, address: event.target.value }))}
                />
              </label>
              <label className="checkout-field--wide">
                <span>{t.order.comment}</span>
                <input
                  value={customer.comment}
                  placeholder={t.order.commentPlaceholder}
                  onChange={(event) => setCustomer((current) => ({ ...current, comment: event.target.value }))}
                />
              </label>
            </div>

            {orderError && <p className="form-error" role="alert">{orderError}</p>}

            <label className="order-preview-label" htmlFor="order-preview">
              {t.order.preview}
            </label>
            <textarea id="order-preview" readOnly value={orderText} />
            <div className="order-actions">
              <button type="button" className="button button--outline" onClick={copyOrder}>
                {copied ? <CheckIcon size={17} /> : <CopyIcon size={17} />} {copied ? t.order.copied : t.order.copy}
              </button>
              <button type="submit" className="button button--primary">
                {t.order.send} <TelegramIcon size={17} />
              </button>
            </div>
            <a
              href={`https://t.me/${TELEGRAM_ORDER_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="channel-link"
            >
              {t.order.directContact} <ArrowIcon size={16} />
            </a>
          </form>
        </div>
      )}
    </>
  );
}
