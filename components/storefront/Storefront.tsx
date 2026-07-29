"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { ArrowIcon, BagIcon, CloseIcon, GiftIcon, HandIcon, LeafIcon, MenuIcon, MinusIcon, PlusIcon, ShieldIcon, TelegramIcon } from "./icons";

const TELEGRAM_ORDER = "thatswriter";
const TELEGRAM_CHANNEL = "silentscriptuz";
const CART_KEY = "silent-script-cart-v5";
const LOCALE_KEY = "silent-script-locale";
const PAGE_TYPES: PageType[] = ["lined", "dotted", "grid", "blank"];

type CategoryFilter = "all" | ProductCategory;
type Customer = { name: string; phone: string; address: string; comment: string };

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (value: Locale) => void }) {
  return (
    <div className={styles.language} aria-label="Language / Til / Язык">
      {(["uz", "en", "ru"] as Locale[]).map((item) => (
        <button key={item} type="button" className={item === locale ? styles.languageActive : ""} onClick={() => onChange(item)} aria-pressed={item === locale}>
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ProductImage({ product, locale, className }: { product: CatalogProduct; locale: Locale; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !product.image) {
    return (
      <div className={`${styles.imageFallback} ${className ?? ""}`} style={{ background: `linear-gradient(145deg, ${product.colors[0]?.hex ?? "#765343"}, #2f241d)` }}>
        <span>silent script.</span>
      </div>
    );
  }
  return <img className={className} src={product.image} alt={product.name[locale]} loading="lazy" onError={() => setFailed(true)} />;
}

export default function Storefront() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [configuration, setConfiguration] = useState<CartConfiguration>({ colorId: "", includeNotebook: true, pageType: "lined", initial: "", giftBox: false });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "", comment: "" });
  const [error, setError] = useState("");
  const t = ui[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    if (storedLocale === "uz" || storedLocale === "en" || storedLocale === "ru") setLocale(storedLocale);
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      if (Array.isArray(saved)) setCart(saved as CartItem[]);
    } catch {
      localStorage.removeItem(CART_KEY);
    } finally {
      setCartReady(true);
    }
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Catalog request failed")))
      .then((data: unknown) => { if (isCatalog(data)) setCatalog(data); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (cartReady) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  const overlayOpen = Boolean(selected || cartOpen || orderOpen || mobileOpen);
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelected(null);
      setCartOpen(false);
      setOrderOpen(false);
      setMobileOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const activeProducts = useMemo(() => catalog.products.filter((product) => product.active), [catalog]);
  const products = useMemo(() => activeProducts.filter((product) => category === "all" || product.category === category), [activeProducts, category]);
  const categoryFilters = useMemo(() => (["all", ...(["cover", "notebook", "set"] as ProductCategory[]).filter((item) => activeProducts.some((product) => product.category === item))] as CategoryFilter[]), [activeProducts]);
  const featured = activeProducts.find((product) => product.featured && product.category === "cover") ?? activeProducts.find((product) => product.category === "cover") ?? activeProducts[0];
  const builderProduct = activeProducts.find((product) => product.supportsInsert && product.category === "cover") ?? featured;
  const storyProduct = activeProducts.find((product) => product.category === "cover" && product.id !== featured?.id) ?? featured;
  const selectedPrice = selected ? productPrice(selected, configuration) : 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function scrollTo(id: string) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openProduct(product: CatalogProduct | undefined) {
    if (!product) return;
    setSelected(product);
    setConfiguration({
      colorId: product.colors[0]?.id ?? "",
      includeNotebook: product.supportsInsert,
      pageType: product.pageType ?? "lined",
      initial: "",
      giftBox: false,
    });
  }

  function addToCart() {
    if (!selected) return;
    const config = { ...configuration };
    const key = [selected.id, config.colorId, config.includeNotebook ? "insert" : "cover", config.pageType, config.initial || "none", config.giftBox ? "gift" : "standard"].join("-");
    const unitPrice = productPrice(selected, config);
    setCart((current) => {
      const found = current.find((item) => item.key === key);
      return found
        ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { key, productId: selected.id, quantity: 1, unitPrice, configuration: config }];
    });
    setSelected(null);
    setCartOpen(true);
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) => current.flatMap((item) => item.key !== key ? [item] : item.quantity + delta <= 0 ? [] : [{ ...item, quantity: item.quantity + delta }]));
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError(t.required);
      return;
    }
    setError("");
    const lines = cart.map((item, index) => {
      const product = catalog.products.find((entry) => entry.id === item.productId);
      if (!product) return "";
      const color = product.colors.find((entry) => entry.id === item.configuration.colorId);
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
  }

  const categoryLabel = (product: CatalogProduct) => product.category === "cover" ? t.cover : product.category === "notebook" ? t.notebook : t.set;

  return (
    <main className={styles.site}>
      <div className={styles.announcement}>
        <span><HandIcon size={15} /> {t.announcement}</span>
        <span className={styles.announcementNote}><ShieldIcon size={15} /> {t.announcementNote}</span>
        <a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer"><TelegramIcon size={15} /> @{TELEGRAM_CHANNEL}</a>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#home" aria-label="silent script. home">
          <img src="/brand-avatar.svg" alt="" />
          <span>silent script.</span>
        </a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <button type="button" onClick={() => scrollTo("home")}>{t.home}</button>
          <button type="button" onClick={() => scrollTo("catalog")}>{t.shop}</button>
          <button type="button" onClick={() => scrollTo("builder")}>{t.builder}</button>
          <button type="button" onClick={() => scrollTo("story")}>{t.about}</button>
          <button type="button" onClick={() => scrollTo("process")}>{t.processNav}</button>
        </nav>
        <div className={styles.headerActions}>
          <LanguageSwitcher locale={locale} onChange={setLocale} />
          <button className={styles.cartButton} type="button" onClick={() => setCartOpen(true)} aria-label={`${t.cart}: ${cartCount}`}>
            <BagIcon size={22} />
            {cartCount > 0 ? <span>{cartCount}</span> : null}
          </button>
          <button className={styles.mobileMenuButton} type="button" onClick={() => setMobileOpen(true)} aria-label={t.menu}>
            <MenuIcon size={23} />
          </button>
        </div>
      </header>

      <section id="home" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className={styles.heroDescription}>{t.heroText}</p>
          <div className={styles.heroActions}>
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => scrollTo("catalog")}>
              {t.browse}<ArrowIcon size={18} />
            </button>
            <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={() => openProduct(builderProduct)}>
              {t.create}
            </button>
          </div>
          <div className={styles.heroMeta}>
            {t.heroMeta.map((item) => <span key={item}><i />{item}</span>)}
          </div>
        </div>
        <div className={styles.heroMedia}>
          {featured ? <ProductImage product={featured} locale={locale} className={styles.coverImage} /> : null}
          {featured ? (
            <button type="button" className={styles.heroProductCard} onClick={() => openProduct(featured)}>
              <span>{t.heroProduct}</span>
              <strong>{featured.name[locale]}</strong>
              <small>{formatPrice(featured.basePrice, t.currency)} <ArrowIcon size={15} /></small>
            </button>
          ) : null}
          <div className={styles.heroStamp}>SS<br/><span>made slowly</span></div>
        </div>
      </section>

      <section className={styles.trustStrip} aria-label="Product benefits">
        {(t.trust as ReadonlyArray<readonly [string, string]>).map(([title, text], index) => {
          const icons = [<LeafIcon key="leaf" />, <HandIcon key="hand" />, <ShieldIcon key="shield" />, <GiftIcon key="gift" />];
          return <article key={title}><div>{icons[index]}</div><span><strong>{title}</strong><small>{text}</small></span></article>;
        })}
      </section>

      <section id="catalog" className={styles.catalogSection}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>{t.catalogEyebrow}</p><h2>{t.catalogTitle}</h2></div>
          <p>{t.catalogText}</p>
        </div>
        <div className={styles.filters} role="group" aria-label="Product categories">
          {categoryFilters.map((item) => (
            <button key={item} type="button" className={category === item ? styles.filterActive : ""} onClick={() => setCategory(item)}>
              {item === "all" ? t.all : t[item]}
            </button>
          ))}
        </div>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <article className={styles.productCard} key={product.id}>
              <button className={styles.productImageButton} type="button" onClick={() => openProduct(product)} aria-label={`${t.details}: ${product.name[locale]}`}>
                <ProductImage product={product} locale={locale} className={styles.coverImage} />
                {product.badge ? <span className={styles.productBadge}>{product.badge[locale]}</span> : null}
                <span className={styles.quickAction}>{t.details}<ArrowIcon size={16} /></span>
              </button>
              <div className={styles.productInfo}>
                <small>{categoryLabel(product)} · {product.size}</small>
                <h3>{product.name[locale]}</h3>
                <p>{product.description[locale]}</p>
                <div className={styles.productColors} aria-label={`${product.colors.length} ${t.colors}`}>
                  {product.colors.slice(0, 5).map((color) => <i key={color.id} title={color.name[locale]} style={{ backgroundColor: color.hex }} />)}
                  <span>{product.colors.length} {t.colors}</span>
                </div>
                <footer>
                  <strong>{t.from} {formatPrice(product.basePrice, t.currency)}</strong>
                  <button type="button" onClick={() => openProduct(product)} aria-label={`${t.details}: ${product.name[locale]}`}><ArrowIcon size={18} /></button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="builder" className={styles.builderSection}>
        <div className={styles.builderVisual}>
          {builderProduct ? <ProductImage product={builderProduct} locale={locale} className={styles.coverImage} /> : null}
          <div className={styles.builderPalette}>
            {builderProduct?.colors.slice(0, 5).map((color) => <i key={color.id} style={{ backgroundColor: color.hex }} />)}
          </div>
        </div>
        <div className={styles.builderContent}>
          <p className={styles.eyebrowLight}>{t.builderEyebrow}</p>
          <h2>{t.builderTitle}</h2>
          <p className={styles.builderDescription}>{t.builderText}</p>
          <div className={styles.builderSteps}>
            {(t.builderSteps as ReadonlyArray<readonly [string, string]>).map(([title, text], index) => (
              <article key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
          <button className={`${styles.button} ${styles.buttonLight}`} type="button" onClick={() => openProduct(builderProduct)}>
            {t.start}<ArrowIcon size={18} />
          </button>
        </div>
      </section>

      <section id="story" className={styles.storySection}>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>{t.storyEyebrow}</p>
          <h2>{t.storyTitle}</h2>
          <p>{t.storyText}</p>
          <button className={styles.textLink} type="button" onClick={() => { setCategory("cover"); scrollTo("catalog"); }}>
            {t.storyLink}<ArrowIcon size={18} />
          </button>
        </div>
        <div className={styles.storyImage}>
          {storyProduct ? <ProductImage product={storyProduct} locale={locale} className={styles.coverImage} /> : null}
          <blockquote>“silent script.”</blockquote>
        </div>
      </section>

      <section id="process" className={styles.processSection}>
        <div className={styles.sectionHeadingCompact}>
          <p className={styles.eyebrow}>{t.processEyebrow}</p>
          <h2>{t.processTitle}</h2>
        </div>
        <div className={styles.processGrid}>
          {(t.process as ReadonlyArray<readonly [string, string]>).map(([title, text], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section id="faq" className={styles.faqSection}>
        <div><p className={styles.eyebrow}>{t.faqEyebrow}</p><h2>{t.faqTitle}</h2></div>
        <div className={styles.faqList}>
          {(t.faq as ReadonlyArray<readonly [string, string]>).map(([question, answer]) => (
            <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <a href="#home"><img src="/brand-avatar.svg" alt=""/><span>silent script.</span></a>
            <p>{t.footerText}</p>
            <a className={styles.telegramLink} href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer"><TelegramIcon size={18}/>@{TELEGRAM_CHANNEL}</a>
          </div>
          <div><h3>{t.footerShop}</h3><button onClick={() => scrollTo("catalog")}>{t.shop}</button><button onClick={() => scrollTo("builder")}>{t.builder}</button>{activeProducts.some((product) => product.category === "set") ? <button onClick={() => { setCategory("set"); scrollTo("catalog"); }}>{t.set}</button> : null}</div>
          <div><h3>{t.footerHelp}</h3><button onClick={() => scrollTo("process")}>{t.processNav}</button><button onClick={() => scrollTo("process")}>{t.contact}</button><button onClick={() => scrollTo("faq")}>FAQ</button></div>
          <div><h3>{t.footerBrand}</h3><button onClick={() => scrollTo("story")}>{t.about}</button><a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer">{t.channel}</a><a href="/admin">{t.admin}</a></div>
        </div>
        <div className={styles.footerBottom}><span>© 2026 silent script. {t.rights}</span><span>Namangan · Uzbekistan</span></div>
      </footer>

      {mobileOpen ? (
        <div className={styles.mobileOverlay} onMouseDown={() => setMobileOpen(false)}>
          <aside className={styles.mobileMenu} onMouseDown={(event) => event.stopPropagation()}>
            <header><span>silent script.</span><button type="button" onClick={() => setMobileOpen(false)} aria-label={t.close}><CloseIcon/></button></header>
            <nav>{[["home", t.home], ["catalog", t.shop], ["builder", t.builder], ["story", t.about], ["process", t.processNav]].map(([id, label]) => <button key={id} type="button" onClick={() => scrollTo(id)}>{label}<ArrowIcon/></button>)}</nav>
            <LanguageSwitcher locale={locale} onChange={setLocale}/>
          </aside>
        </div>
      ) : null}

      {selected ? (
        <div className={styles.overlay} onMouseDown={() => setSelected(null)}>
          <section className={styles.productModal} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={selected.name[locale]}>
            <button className={styles.closeButton} type="button" onClick={() => setSelected(null)} aria-label={t.close}><CloseIcon /></button>
            <div className={styles.modalImage}><ProductImage product={selected} locale={locale} className={styles.coverImage}/><span>{selected.size}</span></div>
            <div className={styles.modalBody}>
              <small className={styles.modalCategory}>{categoryLabel(selected)} · {selected.size}</small>
              <h2>{selected.name[locale]}</h2>
              <p className={styles.modalDescription}>{selected.description[locale]}</p>

              <fieldset className={styles.optionGroup}>
                <legend>{t.color}</legend>
                <div className={styles.colorOptions}>
                  {selected.colors.map((color) => (
                    <button type="button" key={color.id} className={configuration.colorId === color.id ? styles.optionActive : ""} onClick={() => setConfiguration((current) => ({ ...current, colorId: color.id }))}>
                      <i style={{ backgroundColor: color.hex }}/><span>{color.name[locale]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {selected.supportsInsert ? (
                <fieldset className={styles.optionGroup}>
                  <legend>{t.insert}</legend>
                  <div className={styles.segmentedOptions}>
                    <button type="button" className={configuration.includeNotebook ? styles.optionActive : ""} onClick={() => setConfiguration((current) => ({ ...current, includeNotebook: true }))}>{t.yesInsert}<small>+ {formatPrice(selected.insertPrice ?? 0, t.currency)}</small></button>
                    <button type="button" className={!configuration.includeNotebook ? styles.optionActive : ""} onClick={() => setConfiguration((current) => ({ ...current, includeNotebook: false }))}>{t.noInsert}</button>
                  </div>
                </fieldset>
              ) : null}

              {selected.supportsInsert && configuration.includeNotebook ? (
                <fieldset className={styles.optionGroup}>
                  <legend>{t.page}</legend>
                  <div className={styles.pageOptions}>
                    {PAGE_TYPES.map((page) => <button type="button" key={page} className={configuration.pageType === page ? styles.optionActive : ""} onClick={() => setConfiguration((current) => ({ ...current, pageType: page }))}><i className={styles[`page_${page}`]}/>{t.pages[page]}</button>)}
                  </div>
                </fieldset>
              ) : null}

              <div className={styles.twoColumns}>
                <label className={styles.inputField}><span>{t.initial}</span><input value={configuration.initial} maxLength={1} onChange={(event) => setConfiguration((current) => ({ ...current, initial: normalizeInitial(event.target.value) }))} placeholder="G"/><small>{t.initialHint}</small></label>
                <fieldset className={styles.optionGroup}><legend>{t.gift}</legend><div className={styles.segmentedOptions}><button type="button" className={!configuration.giftBox ? styles.optionActive : ""} onClick={() => setConfiguration((current) => ({ ...current, giftBox: false }))}>{t.no}</button><button type="button" className={configuration.giftBox ? styles.optionActive : ""} onClick={() => setConfiguration((current) => ({ ...current, giftBox: true }))}>{t.yes}</button></div></fieldset>
              </div>

              <div className={styles.modalFooter}>
                <div><span>{t.total}</span><strong>{formatPrice(selectedPrice, t.currency)}</strong></div>
                <button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={addToCart}><BagIcon size={18}/>{t.add}</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {cartOpen ? (
        <div className={styles.overlay} onMouseDown={() => setCartOpen(false)}>
          <aside className={styles.cartDrawer} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.cart}>
            <header><div><p>{t.cart}</p><h2>{cartCount} {t.cart.toLowerCase()}</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label={t.close}><CloseIcon/></button></header>
            <div className={styles.cartList}>
              {cart.length === 0 ? <div className={styles.emptyCart}><BagIcon size={34}/><h3>{t.empty}</h3><p>{t.emptyText}</p><button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => { setCartOpen(false); scrollTo("catalog"); }}>{t.browse}</button></div> : cart.map((item) => {
                const product = catalog.products.find((entry) => entry.id === item.productId);
                if (!product) return null;
                const color = product.colors.find((entry) => entry.id === item.configuration.colorId);
                return (
                  <article key={item.key}>
                    <div className={styles.cartImage}><ProductImage product={product} locale={locale} className={styles.coverImage}/></div>
                    <div className={styles.cartItemInfo}>
                      <small>{product.size} · {color?.name[locale]}</small>
                      <h3>{product.name[locale]}</h3>
                      <p>{product.supportsInsert ? (item.configuration.includeNotebook ? `${t.withInsert} · ${t.pages[item.configuration.pageType]}` : t.onlyCover) : t.pages[item.configuration.pageType]}</p>
                      <strong>{formatPrice(item.unitPrice, t.currency)}</strong>
                      <footer><div><button type="button" onClick={() => changeQuantity(item.key, -1)} aria-label="Decrease"><MinusIcon size={15}/></button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.key, 1)} aria-label="Increase"><PlusIcon size={15}/></button></div><button type="button" onClick={() => setCart((current) => current.filter((entry) => entry.key !== item.key))}>{t.remove}</button></footer>
                    </div>
                  </article>
                );
              })}
            </div>
            {cart.length ? <footer className={styles.cartFooter}><div><span>{t.total}</span><strong>{formatPrice(cartTotal, t.currency)}</strong></div><button className={`${styles.button} ${styles.buttonPrimary}`} type="button" onClick={() => { setCartOpen(false); setOrderOpen(true); }}>{t.checkout}<ArrowIcon size={18}/></button></footer> : null}
          </aside>
        </div>
      ) : null}

      {orderOpen ? (
        <div className={styles.overlay} onMouseDown={() => setOrderOpen(false)}>
          <section className={styles.orderModal} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.orderTitle}>
            <button className={styles.closeButton} type="button" onClick={() => setOrderOpen(false)} aria-label={t.close}><CloseIcon/></button>
            <p className={styles.eyebrow}>TELEGRAM ORDER</p>
            <h2>{t.orderTitle}</h2>
            <p>{t.orderText}</p>
            <form onSubmit={submitOrder}>
              <label>{t.name} *<input autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })}/></label>
              <label>{t.phone} *<input inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="+998"/></label>
              <label>{t.address}<input autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })}/></label>
              <label>{t.comment}<textarea rows={4} value={customer.comment} onChange={(event) => setCustomer({ ...customer, comment: event.target.value })}/></label>
              {error ? <p className={styles.error}>{error}</p> : null}
              <div className={styles.orderTotal}><span>{t.total}</span><strong>{formatPrice(cartTotal, t.currency)}</strong></div>
              <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit"><TelegramIcon size={18}/>{t.send}</button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
