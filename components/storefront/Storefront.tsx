"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent, type MouseEvent } from "react";
import defaultCatalog from "@/data/catalog.json";
import {
  formatPrice,
  isCatalog,
  normalizeInitial,
  productPrice,
  type CartConfiguration,
  type CartItem,
  type Catalog,
  type CatalogProduct,
  type Locale,
  type PageType,
  type ProductCategory,
} from "@/lib/catalog";
import { ui } from "./copy";
import styles from "./styles";
import {
  ArrowIcon,
  BagIcon,
  CloseIcon,
  GiftIcon,
  HandIcon,
  LeafIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  TelegramIcon,
} from "./icons";
import "./storefront.css";

const TELEGRAM_ORDER = "thatswriter";
const TELEGRAM_CHANNEL = "silentscriptuz";
const CART_KEY = "silent-script-cart-v6";
const LOCALE_KEY = "silent-script-locale";

type CategoryFilter = "all" | ProductCategory;
type Customer = { name: string; phone: string; address: string; comment: string };

const pageTypes: PageType[] = ["lined", "dotted", "grid", "blank"];
const categories: CategoryFilter[] = ["all", "cover", "notebook", "set"];
const trustIcons = [LeafIcon, HandIcon, GiftIcon, ShieldIcon];

function productConfiguration(product: CatalogProduct): CartConfiguration {
  return {
    colorId: product.colors[0]?.id ?? "",
    includeNotebook: product.supportsInsert,
    pageType: product.pageType ?? "lined",
    initial: "",
    giftBox: false,
  };
}

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className={styles.language} aria-label="Language">
      {(["uz", "en", "ru"] as Locale[]).map((item) => (
        <button
          type="button"
          key={item}
          className={item === locale ? styles.languageActive : ""}
          onClick={() => onChange(item)}
          aria-pressed={item === locale}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ProductImage({ product, locale, eager = false }: { product: CatalogProduct; locale: Locale; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const fallback = product.colors[0]?.hex ?? "#6c4e3b";

  if (!product.image || failed) {
    return (
      <div className={styles.imageFallback} style={{ background: `linear-gradient(145deg, ${fallback}, #28221e)` }}>
        <span>silent script.</span>
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name[locale]}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function ProductMeta({ product, locale, currency }: { product: CatalogProduct; locale: Locale; currency: string }) {
  const t = ui[locale];
  return (
    <>
      <div className={styles.productTopline}>
        <span>{product.category === "cover" ? t.cover : product.category === "notebook" ? t.notebook : t.set}</span>
        <span>{product.size}</span>
      </div>
      <h3>{product.name[locale]}</h3>
      <div className={styles.productPriceRow}>
        <strong>{t.from} {formatPrice(product.basePrice, currency)}</strong>
        <span>{product.colors.length} {t.colors}</span>
      </div>
    </>
  );
}

export default function Storefront() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [configuration, setConfiguration] = useState<CartConfiguration>({ colorId: "", includeNotebook: true, pageType: "lined", initial: "", giftBox: false });
  const [builderProductId, setBuilderProductId] = useState("");
  const [builderConfiguration, setBuilderConfiguration] = useState<CartConfiguration>({ colorId: "", includeNotebook: true, pageType: "lined", initial: "", giftBox: false });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "", comment: "" });
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const t = ui[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    if (storedLocale === "uz" || storedLocale === "en" || storedLocale === "ru") setLocale(storedLocale);

    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      if (Array.isArray(saved)) setCart(saved);
    } catch {
      localStorage.removeItem(CART_KEY);
    }

    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalog request failed")))
      .then((data: unknown) => { if (isCatalog(data)) setCatalog(data); })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    const shouldLock = selected || cartOpen || orderOpen || menuOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected, cartOpen, orderOpen, menuOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelected(null);
      setCartOpen(false);
      setOrderOpen(false);
      setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeProducts = useMemo(() => catalog.products.filter((product) => product.active), [catalog]);
  const products = useMemo(
    () => activeProducts.filter((product) => category === "all" || product.category === category),
    [activeProducts, category],
  );
  const coverProducts = useMemo(() => activeProducts.filter((product) => product.category === "cover" && product.supportsInsert), [activeProducts]);
  const featured = activeProducts.find((product) => product.featured) ?? activeProducts[0];
  const builderProduct = coverProducts.find((product) => product.id === builderProductId) ?? coverProducts[0] ?? featured;
  const selectedPrice = selected ? productPrice(selected, configuration) : 0;
  const builderPrice = builderProduct ? productPrice(builderProduct, builderConfiguration) : 0;
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

  useEffect(() => {
    if (!builderProduct) return;
    setBuilderProductId((current) => current || builderProduct.id);
    setBuilderConfiguration((current) =>
      builderProduct.colors.some((color) => color.id === current.colorId)
        ? current
        : productConfiguration(builderProduct),
    );
  }, [builderProduct]);

  function openProduct(product: CatalogProduct) {
    setSelected(product);
    setConfiguration(productConfiguration(product));
  }

  function chooseBuilderProduct(product: CatalogProduct) {
    setBuilderProductId(product.id);
    setBuilderConfiguration(productConfiguration(product));
  }

  function addItem(product: CatalogProduct, config: CartConfiguration) {
    const normalized = { ...config, initial: normalizeInitial(config.initial) };
    const unitPrice = productPrice(product, normalized);
    const key = [
      product.id,
      normalized.colorId,
      normalized.includeNotebook ? "insert" : "cover",
      normalized.pageType,
      normalized.initial || "none",
      normalized.giftBox ? "gift" : "standard",
    ].join("-");

    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { key, productId: product.id, quantity: 1, unitPrice, configuration: normalized }];
    });
    setSelected(null);
    setCartOpen(true);
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.key !== key) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError(t.required);
      return;
    }
    if (!cart.length) {
      setError(t.empty);
      return;
    }

    const lines = cart.map((item, index) => {
      const product = catalog.products.find((candidate) => candidate.id === item.productId);
      if (!product) return "";
      const color = product.colors.find((candidate) => candidate.id === item.configuration.colorId);
      const details = [
        color?.name[locale],
        product.size,
        product.supportsInsert ? (item.configuration.includeNotebook ? `${t.withInsert}, ${t.pages[item.configuration.pageType]}` : t.onlyCover) : null,
        item.configuration.initial ? `${t.initial}: ${item.configuration.initial}` : null,
        item.configuration.giftBox ? t.gift : null,
      ].filter(Boolean).join(" · ");
      return `${index + 1}. ${product.name[locale]}\n   ${details}\n   ${item.quantity} × ${formatPrice(item.unitPrice, t.currency)}`;
    }).filter(Boolean);

    const text = `${t.greeting}\n\n${lines.join("\n\n")}\n\n${t.total}: ${formatPrice(cartTotal, t.currency)}\n\n${t.name}: ${customer.name}\n${t.phone}: ${customer.phone}${customer.address ? `\n${t.address}: ${customer.address}` : ""}${customer.comment ? `\n${t.comment}: ${customer.comment}` : ""}`;
    window.open(`https://t.me/${TELEGRAM_ORDER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setError("");
  }

  function navTo(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className={styles.site}>
      <div className={styles.announcement}>
        <span>{t.announcement}</span>
        <span>{t.announcementNote}</span>
        <a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer"><TelegramIcon size={15}/> @{TELEGRAM_CHANNEL}</a>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#home" aria-label="silent script home">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>silent script.</span>
        </a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#home">{t.home}</a>
          <a href="#catalog">{t.shop}</a>
          <a href="#builder">{t.builder}</a>
          <a href="#story">{t.about}</a>
          <a href="#process">{t.processNav}</a>
        </nav>
        <div className={styles.headerActions}>
          <LanguageSwitcher locale={locale} onChange={setLocale}/>
          <button className={styles.cartButton} type="button" onClick={() => setCartOpen(true)} aria-label={`${t.cart}: ${cartCount}`}>
            <BagIcon size={21}/><span>{cartCount}</span>
          </button>
          <button className={styles.menuButton} type="button" onClick={() => setMenuOpen(true)} aria-label={t.menu}><MenuIcon/></button>
        </div>
      </header>

      <section id="home" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className={styles.heroText}>{t.heroText}</p>
          <div className={styles.heroActions}>
            <a className={`${styles.button} ${styles.buttonPrimary}`} href="#catalog">{t.browse}<ArrowIcon/></a>
            <a className={`${styles.button} ${styles.buttonSecondary}`} href="#builder">{t.create}</a>
          </div>
          <div className={styles.heroMeta}>
            {t.heroMeta.map((item: string) => <span key={item}><i/> {item}</span>)}
          </div>
        </div>
        <div className={styles.heroMedia}>
          {featured ? <ProductImage product={featured} locale={locale} eager/> : <div className={styles.imageFallback}>silent script.</div>}
          {featured ? (
            <button className={styles.heroProductCard} type="button" onClick={() => openProduct(featured)}>
              <span>{t.heroProduct}</span>
              <strong>{featured.name[locale]}</strong>
              <small>{formatPrice(featured.basePrice, t.currency)} <ArrowIcon size={15}/></small>
            </button>
          ) : null}
        </div>
      </section>

      <section className={styles.trustStrip} aria-label="Benefits">
        {t.trust.map(([title, text]: [string, string], index: number) => {
          const Icon = trustIcons[index] ?? ShieldIcon;
          return <article key={title}><Icon size={25}/><div><h3>{title}</h3><p>{text}</p></div></article>;
        })}
      </section>

      <section id="catalog" className={styles.catalogSection}>
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>{t.catalogEyebrow}</p><h2>{t.catalogTitle}</h2></div>
          <p>{t.catalogText}</p>
        </div>
        <div className={styles.filters} role="group" aria-label="Product categories">
          {categories.map((item) => (
            <button key={item} type="button" className={category === item ? styles.filterActive : ""} onClick={() => setCategory(item)}>
              {item === "all" ? t.all : t[item]}
            </button>
          ))}
        </div>
        {products.length ? (
          <div className={styles.productGrid}>
            {products.map((product) => (
              <article className={styles.productCard} key={product.id}>
                <button className={styles.productImage} type="button" onClick={() => openProduct(product)} aria-label={`${t.details}: ${product.name[locale]}`}>
                  <ProductImage product={product} locale={locale}/>
                  {product.badge ? <span className={styles.badge}>{product.badge[locale]}</span> : null}
                  <span className={styles.quickView}>{t.details}<ArrowIcon size={16}/></span>
                </button>
                <div className={styles.productBody}>
                  <ProductMeta product={product} locale={locale} currency={t.currency}/>
                  <div className={styles.swatches} aria-label={`${product.colors.length} ${t.colors}`}>
                    {product.colors.slice(0, 5).map((color) => <i key={color.id} style={{ background: color.hex }} title={color.name[locale]}/>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : <div className={styles.emptyCatalog}>{t.emptyText}</div>}
      </section>

      {builderProduct ? (
        <section id="builder" className={styles.builderSection}>
          <div className={styles.builderIntro}>
            <p className={styles.eyebrow}>{t.builderEyebrow}</p>
            <h2>{t.builderTitle}</h2>
            <p>{t.builderText}</p>
            <div className={styles.builderSteps}>
              {t.builderSteps.map(([title, text]: [string, string], index: number) => <article key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
            </div>
          </div>
          <div className={styles.builderCard}>
            <div className={styles.builderPreview} style={{ "--preview-color": builderProduct.colors.find((color) => color.id === builderConfiguration.colorId)?.hex ?? builderProduct.colors[0]?.hex ?? "#6b4b3a" } as CSSProperties}>
              <ProductImage product={builderProduct} locale={locale}/>
              {builderConfiguration.initial ? <span className={styles.previewInitial}>{builderConfiguration.initial}</span> : null}
              <div className={styles.builderPrice}><small>{t.total}</small><strong>{formatPrice(builderPrice, t.currency)}</strong></div>
            </div>
            <div className={styles.builderControls}>
              <div className={styles.controlGroup}>
                <label>{t.builderSteps[0][0]}</label>
                <div className={styles.modelChoices}>
                  {coverProducts.map((product) => <button key={product.id} type="button" className={builderProduct.id === product.id ? styles.choiceActive : ""} onClick={() => chooseBuilderProduct(product)}><span>{product.size}</span>{product.name[locale]}</button>)}
                </div>
              </div>
              <div className={styles.controlGroup}>
                <label>{t.color}</label>
                <div className={styles.colorChoices}>
                  {builderProduct.colors.map((color) => <button key={color.id} type="button" className={builderConfiguration.colorId === color.id ? styles.colorActive : ""} onClick={() => setBuilderConfiguration((current) => ({ ...current, colorId: color.id }))} aria-label={color.name[locale]} title={color.name[locale]}><i style={{ background: color.hex }}/></button>)}
                </div>
              </div>
              <div className={styles.controlSplit}>
                <div className={styles.controlGroup}>
                  <label>{t.page}</label>
                  <div className={styles.segmented}>{pageTypes.map((page) => <button key={page} type="button" className={builderConfiguration.pageType === page ? styles.segmentActive : ""} onClick={() => setBuilderConfiguration((current) => ({ ...current, pageType: page }))}>{t.pages[page]}</button>)}</div>
                </div>
                <div className={styles.controlGroup}>
                  <label htmlFor="builder-initial">{t.initial}</label>
                  <input id="builder-initial" value={builderConfiguration.initial} maxLength={1} onChange={(event: ChangeEvent<HTMLInputElement>) => setBuilderConfiguration((current) => ({ ...current, initial: normalizeInitial(event.target.value) }))} placeholder="G"/>
                  <small>{t.initialHint}</small>
                </div>
              </div>
              <div className={styles.builderFooter}>
                <label className={styles.checkbox}><input type="checkbox" checked={builderConfiguration.giftBox} onChange={(event: ChangeEvent<HTMLInputElement>) => setBuilderConfiguration((current) => ({ ...current, giftBox: event.target.checked }))}/><span>{t.gift}</span></label>
                <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => addItem(builderProduct, builderConfiguration)}>{t.add}<BagIcon size={18}/></button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section id="story" className={styles.storySection}>
        <div className={styles.storyVisual}>{featured ? <ProductImage product={featured} locale={locale}/> : null}<span>silent script.</span></div>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>{t.storyEyebrow}</p>
          <h2>{t.storyTitle}</h2>
          <p>{t.storyText}</p>
          <a href="#catalog">{t.storyLink}<ArrowIcon/></a>
        </div>
      </section>

      <section id="process" className={styles.processSection}>
        <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>{t.processEyebrow}</p><h2>{t.processTitle}</h2></div></div>
        <div className={styles.processGrid}>{t.process.map(([title, text]: [string, string], index: number) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className={styles.faqSection}>
        <div><p className={styles.eyebrow}>{t.faqEyebrow}</p><h2>{t.faqTitle}</h2></div>
        <div className={styles.faqList}>{t.faq.map(([question, answer]: [string, string]) => <details key={question}><summary>{question}<PlusIcon size={18}/></summary><p>{answer}</p></details>)}</div>
      </section>

      <footer id="contact" className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}><a className={styles.brand} href="#home"><span className={styles.brandMark}/><span>silent script.</span></a><p>{t.footerText}</p><a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer"><TelegramIcon/> @{TELEGRAM_CHANNEL}</a></div>
          <div><h3>{t.footerShop}</h3><a href="#catalog">{t.shop}</a><a href="#builder">{t.builder}</a><a href="#story">{t.about}</a></div>
          <div><h3>{t.footerHelp}</h3><a href="#process">{t.processNav}</a><a href={`https://t.me/${TELEGRAM_ORDER}`} target="_blank" rel="noreferrer">@{TELEGRAM_ORDER}</a><a href="/admin">{t.admin}</a></div>
          <div><h3>{t.footerBrand}</h3><a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer">{t.channel}</a><a href="#home">Instagram</a><a href="#home">TikTok</a></div>
        </div>
        <div className={styles.footerBottom}><span>© 2026 silent script. {t.rights}</span><LanguageSwitcher locale={locale} onChange={setLocale}/></div>
      </footer>

      {menuOpen ? <div className={styles.mobileMenuBackdrop} onMouseDown={() => setMenuOpen(false)}><aside className={styles.mobileMenu} onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}><header><span>silent script.</span><button type="button" onClick={() => setMenuOpen(false)} aria-label={t.close}><CloseIcon/></button></header><nav>{[["home", t.home], ["catalog", t.shop], ["builder", t.builder], ["story", t.about], ["process", t.processNav], ["contact", t.contact]].map(([id, label]) => <button type="button" key={id} onClick={() => navTo(id)}>{label}<ArrowIcon/></button>)}</nav><LanguageSwitcher locale={locale} onChange={setLocale}/></aside></div> : null}

      {selected ? (
        <div className={styles.overlay} onMouseDown={() => setSelected(null)}>
          <section className={styles.productModal} role="dialog" aria-modal="true" aria-label={selected.name[locale]} onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => setSelected(null)} aria-label={t.close}><CloseIcon/></button>
            <div className={styles.modalImage}><ProductImage product={selected} locale={locale}/></div>
            <div className={styles.modalBody}>
              <div className={styles.productTopline}><span>{selected.category === "cover" ? t.cover : selected.category === "notebook" ? t.notebook : t.set}</span><span>{selected.size}</span></div>
              <h2>{selected.name[locale]}</h2>
              <p>{selected.description[locale]}</p>
              <div className={styles.controlGroup}><label>{t.color}</label><div className={styles.colorChoices}>{selected.colors.map((color) => <button key={color.id} type="button" className={configuration.colorId === color.id ? styles.colorActive : ""} onClick={() => setConfiguration((current) => ({ ...current, colorId: color.id }))} title={color.name[locale]}><i style={{ background: color.hex }}/></button>)}</div></div>
              {selected.supportsInsert ? <div className={styles.controlGroup}><label>{t.insert}</label><div className={styles.segmented}><button type="button" className={configuration.includeNotebook ? styles.segmentActive : ""} onClick={() => setConfiguration((current) => ({ ...current, includeNotebook: true }))}>{t.yesInsert}</button><button type="button" className={!configuration.includeNotebook ? styles.segmentActive : ""} onClick={() => setConfiguration((current) => ({ ...current, includeNotebook: false }))}>{t.noInsert}</button></div></div> : null}
              {selected.supportsInsert && configuration.includeNotebook ? <div className={styles.controlGroup}><label>{t.page}</label><div className={styles.segmented}>{pageTypes.map((page) => <button key={page} type="button" className={configuration.pageType === page ? styles.segmentActive : ""} onClick={() => setConfiguration((current) => ({ ...current, pageType: page }))}>{t.pages[page]}</button>)}</div></div> : null}
              <div className={styles.controlSplit}><div className={styles.controlGroup}><label htmlFor="product-initial">{t.initial}</label><input id="product-initial" value={configuration.initial} maxLength={1} onChange={(event: ChangeEvent<HTMLInputElement>) => setConfiguration((current) => ({ ...current, initial: normalizeInitial(event.target.value) }))} placeholder="G"/><small>{t.initialHint}</small></div><div className={styles.controlGroup}><label>{t.gift}</label><div className={styles.segmented}><button type="button" className={!configuration.giftBox ? styles.segmentActive : ""} onClick={() => setConfiguration((current) => ({ ...current, giftBox: false }))}>{t.no}</button><button type="button" className={configuration.giftBox ? styles.segmentActive : ""} onClick={() => setConfiguration((current) => ({ ...current, giftBox: true }))}>{t.yes}</button></div></div></div>
              <div className={styles.modalFooter}><div><small>{t.total}</small><strong>{formatPrice(selectedPrice, t.currency)}</strong></div><button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => addItem(selected, configuration)}>{t.add}<BagIcon size={18}/></button></div>
            </div>
          </section>
        </div>
      ) : null}

      {cartOpen ? (
        <div className={styles.overlay} onMouseDown={() => setCartOpen(false)}>
          <aside className={styles.cartDrawer} role="dialog" aria-modal="true" aria-label={t.cart} onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <header><div><p>{t.cart}</p><h2>{cartCount}</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label={t.close}><CloseIcon/></button></header>
            <div className={styles.cartList}>
              {!cart.length ? <div className={styles.cartEmpty}><BagIcon size={34}/><h3>{t.empty}</h3><p>{t.emptyText}</p><button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => { setCartOpen(false); navTo("catalog"); }}>{t.browse}</button></div> : cart.map((item) => {
                const product = catalog.products.find((candidate) => candidate.id === item.productId);
                if (!product) return null;
                return <article key={item.key}><div className={styles.cartThumb}><ProductImage product={product} locale={locale}/></div><div><h3>{product.name[locale]}</h3><p>{product.size} · {product.supportsInsert ? (item.configuration.includeNotebook ? t.withInsert : t.onlyCover) : t.pages[item.configuration.pageType]}</p><strong>{formatPrice(item.unitPrice, t.currency)}</strong><footer><div><button type="button" onClick={() => changeQuantity(item.key, -1)} aria-label="Minus"><MinusIcon size={15}/></button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.key, 1)} aria-label="Plus"><PlusIcon size={15}/></button></div><button type="button" onClick={() => setCart((current) => current.filter((candidate) => candidate.key !== item.key))}>{t.remove}</button></footer></div></article>;
              })}
            </div>
            {cart.length ? <footer className={styles.cartFooter}><div><span>{t.total}</span><strong>{formatPrice(cartTotal, t.currency)}</strong></div><button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => { setCartOpen(false); setOrderOpen(true); }}>{t.checkout}<ArrowIcon/></button></footer> : null}
          </aside>
        </div>
      ) : null}

      {orderOpen ? (
        <div className={styles.overlay} onMouseDown={() => setOrderOpen(false)}>
          <section className={styles.orderModal} role="dialog" aria-modal="true" aria-labelledby="order-title" onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => setOrderOpen(false)} aria-label={t.close}><CloseIcon/></button>
            <p className={styles.eyebrow}>TELEGRAM</p><h2 id="order-title">{t.orderTitle}</h2><p>{t.orderText}</p>
            <form onSubmit={submitOrder} noValidate>
              <label>{t.name} *<input value={customer.name} autoComplete="name" onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer((current) => ({ ...current, name: event.target.value }))}/></label>
              <label>{t.phone} *<input value={customer.phone} inputMode="tel" autoComplete="tel" placeholder="+998" onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer((current) => ({ ...current, phone: event.target.value }))}/></label>
              <label>{t.address}<input value={customer.address} autoComplete="street-address" onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer((current) => ({ ...current, address: event.target.value }))}/></label>
              <label>{t.comment}<textarea value={customer.comment} rows={3} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCustomer((current) => ({ ...current, comment: event.target.value }))}/></label>
              {error ? <p className={styles.formError} role="alert">{error}</p> : null}
              <div className={styles.orderTotal}><span>{t.total}</span><strong>{formatPrice(cartTotal, t.currency)}</strong></div>
              <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">{t.send}<TelegramIcon size={18}/></button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
