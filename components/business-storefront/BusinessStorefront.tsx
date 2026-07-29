"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import defaultCatalog from "@/data/catalog.json";
import { isCatalog, type Catalog, type CatalogProduct } from "@/lib/catalog";
import { copy } from "./copy";
import { LowerSections } from "./LowerSections";
import {
  CartIcon, MenuIcon, NotebookVisual, SideVisual, SectionHeading,
  displayName, formatUzs, isCustom, modelSize, paperOptions, threadOptions,
  type CartLine, type Customer, type Locale, type Paper,
} from "./shared";
import "./base.css";
import "./commerce.css";
import "./sections.css";
import "./responsive.css";

const TELEGRAM = "thatswriter";
const INSTAGRAM = "silentscriptuz";
const CART_KEY = "silent-script-cart-v3";
const LOCALE_KEY = "silent-script-locale-v3";

export default function BusinessStorefront() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [selectedId, setSelectedId] = useState("");
  const [leatherId, setLeatherId] = useState("");
  const [threadId, setThreadId] = useState(threadOptions[3].id);
  const [paper, setPaper] = useState<Paper>("cream");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", city: "", address: "", comment: "" });
  const t = copy[locale];

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_KEY);
    if (savedLocale === "uz" || savedLocale === "ru") setLocale(savedLocale);
    try {
      const savedCart: unknown = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(savedCart)) setCart(savedCart as CartLine[]);
    } catch { localStorage.removeItem(CART_KEY); }
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("catalog")))
      .then((value: unknown) => { if (isCatalog(value)) setCatalog(value); })
      .catch(() => undefined);
  }, []);

  useEffect(() => { localStorage.setItem(LOCALE_KEY, locale); document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, checkoutOpen, menuOpen]);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setCartOpen(false); setCheckoutOpen(false); setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const products = useMemo(() => catalog.products.filter((item) => item.active).slice(0, 6), [catalog]);
  const selectedProduct = products.find((item) => item.id === selectedId) || products[3] || products[0];
  const leatherOptions = selectedProduct?.colors?.length ? selectedProduct.colors : [{ id: "brown", hex: "#6b412f", name: { uz: "Jigarrang", en: "Brown", ru: "Коричневый" } }];
  const selectedLeather = leatherOptions.find((item) => item.id === leatherId) || leatherOptions[0];
  const selectedThread = threadOptions.find((item) => item.id === threadId) || threadOptions[0];
  const selectedPrice = selectedProduct?.basePrice || 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!selectedProduct) return;
    if (!selectedId) setSelectedId(selectedProduct.id);
    if (!selectedProduct.colors.some((color) => color.id === leatherId)) setLeatherId(selectedProduct.colors[0]?.id || "");
  }, [selectedProduct, selectedId, leatherId]);

  function scrollTo(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function selectProduct(product: CatalogProduct) {
    setSelectedId(product.id); setLeatherId(product.colors[0]?.id || "");
    window.setTimeout(() => scrollTo("design"), 40);
  }
  function addToCart() {
    if (!selectedProduct || !selectedLeather) return;
    const size = modelSize(selectedProduct);
    const leatherName = selectedLeather.name[locale] || selectedLeather.name.uz;
    const threadName = selectedThread[locale];
    const key = [selectedProduct.id, selectedLeather.id, selectedThread.id, paper].join("-");
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { key, productId: selectedProduct.id, productName: displayName(selectedProduct, locale), price: selectedPrice, quantity: 1, size, leatherName, leatherHex: selectedLeather.hex, threadName, threadHex: selectedThread.hex, paper }];
    });
    setToast(t.added); window.setTimeout(() => setToast(""), 1800);
  }
  function changeQuantity(key: string, delta: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.key !== key) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  }
  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim()) { setError(t.required); return; }
    if (!cart.length) { setError(t.empty); return; }
    const lines = cart.map((item, index) => [
      `${index + 1}. ${item.productName}`, `${t.size}: ${item.size}`, `${t.leather}: ${item.leatherName}`,
      `${t.thread}: ${item.threadName}`, `${t.paper}: ${copy[locale][item.paper]}`,
      `${t.quantity}: ${item.quantity}`, `${t.price}: ${formatUzs(item.price * item.quantity)}`,
    ].join("\n"));
    const message = [
      locale === "uz" ? "Assalomu alaykum! Silent Script’dan quyidagi buyurtmani bermoqchiman:" : "Здравствуйте! Хочу оформить следующий заказ в Silent Script:",
      "", lines.join("\n\n"), "", `${t.total}: ${formatUzs(cartTotal)}`, "",
      `${t.name}: ${customer.name}`, `${t.phone}: ${customer.phone}`, `${t.city}: ${customer.city}`,
      `${t.address}: ${customer.address || "—"}`, `${t.comment}: ${customer.comment || "—"}`, "", t.delivery,
    ].join("\n");
    try { await navigator.clipboard.writeText(message); } catch { /* Clipboard may be blocked. */ }
    window.open(`https://t.me/${TELEGRAM}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setError("");
  }

  const navItems = [["home", t.home], ["products", t.products], ["design", t.builder], ["about", t.about], ["reviews", t.reviews], ["contact", t.contact]] as const;

  return (
    <main className="ex-site">
      <div className="ex-topbar"><span>▱&nbsp; {t.delivery}</span><div><a href={`https://t.me/${TELEGRAM}`} target="_blank" rel="noreferrer">Telegram: @{TELEGRAM}</a><a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer">Instagram: @{INSTAGRAM}</a></div></div>
      <header className="ex-header">
        <a className="ex-logo" href="#home"><span className="ex-logo__mark"/><span>silent script.</span></a>
        <nav aria-label="Asosiy navigatsiya">{navItems.slice(0,5).map(([id,label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
        <div className="ex-actions">
          <button className="ex-language" type="button" onClick={() => setLocale(locale === "uz" ? "ru" : "uz")}>{locale.toUpperCase()}</button>
          <button className="ex-cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`${t.cart}: ${cartCount}`}><CartIcon size={21}/><b>{cartCount}</b></button>
          <button className="ex-order-button" type="button" onClick={() => cart.length ? setCheckoutOpen(true) : scrollTo("products")}>{t.order}</button>
          <button className="ex-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label={t.menu}><MenuIcon/></button>
        </div>
      </header>

      <section className="ex-hero" id="home"><div className="ex-hero__copy"><p className="ex-eyebrow">⌁&nbsp; {t.eyebrow}</p><h1>{t.titleA}<br/><em>{t.titleB}</em></h1><p className="ex-hero__text">{t.heroText}</p><p className="ex-limited">◉&nbsp; {t.limited}</p><button type="button" onClick={() => scrollTo("products")}>{t.view}<span>→</span></button></div><div className="ex-hero__photo" role="img" aria-label="Qo‘lda tayyorlangan charm kundalik"/></section>

      <section className="ex-products" id="products">
        <SectionHeading eyebrow="SILENT COLLECTION" title={t.collection} text={t.collectionText}/>
        <div className="ex-product-grid">{products.map((product,index) => {
          const color = product.colors[0]?.hex || "#6a4632";
          return <article className="ex-product-card" key={product.id}>{index === 0 ? <b className="ex-badge">{locale === "uz" ? "Eng mashhur" : "Популярный"}</b> : null}<div className="ex-product-visual"><NotebookVisual color={color} passport={modelSize(product) === "Passport"}/>{isCustom(product,index) ? <span className="ex-plus">+</span> : null}</div><h3>{displayName(product,locale)}</h3><p>{formatUzs(product.basePrice)} <small>{t.from}</small></p><button type="button" onClick={() => selectProduct(product)}>{t.choose}</button></article>;
        })}</div>
      </section>

      {selectedProduct ? <section className="ex-builder" id="design">
        <SectionHeading eyebrow="CUSTOMIZE" title={t.design} text={t.designText}/>
        <div className="ex-builder-grid">
          <div className="ex-options">
            <fieldset><legend>1. {t.size}</legend><div className="ex-size-options">{products.map((product) => <button key={product.id} type="button" className={selectedProduct.id === product.id ? "is-active" : ""} onClick={() => selectProduct(product)}><strong>{modelSize(product)}</strong><span>{displayName(product,locale)}</span></button>)}</div></fieldset>
            <fieldset><legend>2. {t.leather}</legend><div className="ex-color-options">{leatherOptions.map((color) => <button key={color.id} type="button" className={selectedLeather.id === color.id ? "is-active" : ""} onClick={() => setLeatherId(color.id)} title={color.name[locale]}><i style={{background:color.hex}}/><span>{color.name[locale]}</span></button>)}</div></fieldset>
            <fieldset><legend>3. {t.thread}</legend><div className="ex-color-options">{threadOptions.map((thread) => <button key={thread.id} type="button" className={selectedThread.id === thread.id ? "is-active" : ""} onClick={() => setThreadId(thread.id)} title={thread[locale]}><i style={{background:thread.hex}}/><span>{thread[locale]}</span></button>)}</div></fieldset>
            <fieldset><legend>4. {t.paper}</legend><div className="ex-paper-options">{paperOptions.map((item) => <button key={item} type="button" className={paper === item ? "is-active" : ""} onClick={() => setPaper(item)}>{t[item]}</button>)}</div></fieldset>
          </div>
          <div className="ex-preview"><NotebookVisual color={selectedLeather.hex} large passport={modelSize(selectedProduct) === "Passport"}/><SideVisual color={selectedLeather.hex} thread={selectedThread.hex}/></div>
          <aside className="ex-summary"><div><p>SILENT SCRIPT</p><h3>{t.summary}</h3></div><dl><div><dt>{t.size}</dt><dd>{modelSize(selectedProduct)}</dd></div><div><dt>{t.leather}</dt><dd>{selectedLeather.name[locale]}</dd></div><div><dt>{t.thread}</dt><dd>{selectedThread[locale]}</dd></div><div><dt>{t.paper}</dt><dd>{t[paper]}</dd></div></dl><div className="ex-summary__price"><span>{t.price}</span><strong>{formatUzs(selectedPrice)}</strong></div><button type="button" onClick={addToCart}><CartIcon size={19}/>{t.add}</button><small>{t.delivery}</small></aside>
        </div>
      </section> : null}

      <LowerSections locale={locale} scrollTo={scrollTo}/>

      {menuOpen ? <div className="ex-mobile-overlay" onMouseDown={() => setMenuOpen(false)}><aside className="ex-mobile-menu" onMouseDown={(event:MouseEvent<HTMLElement>) => event.stopPropagation()}><header><span>silent script.</span><button type="button" onClick={() => setMenuOpen(false)}>×</button></header><nav>{navItems.map(([id,label]) => <button type="button" key={id} onClick={() => scrollTo(id)}>{label}<span>→</span></button>)}</nav><div><button type="button" onClick={() => setLocale(locale === "uz" ? "ru" : "uz")}>{locale === "uz" ? "Русский" : "O‘zbekcha"}</button><a href={`https://t.me/${TELEGRAM}`} target="_blank" rel="noreferrer">@{TELEGRAM}</a></div></aside></div> : null}
      {toast ? <div className="ex-toast">✓ {toast}</div> : null}

      {cartOpen ? <div className="ex-overlay" onMouseDown={() => setCartOpen(false)}><aside className="ex-cart" onMouseDown={(event:MouseEvent<HTMLElement>) => event.stopPropagation()} role="dialog" aria-modal="true"><header><div><p>SILENT SCRIPT</p><h2>{t.cart}</h2></div><button type="button" onClick={() => setCartOpen(false)}>×</button></header><div className="ex-cart-list">{!cart.length ? <div className="ex-empty"><CartIcon size={38}/><h3>{t.empty}</h3><p>{t.emptyHint}</p><button type="button" onClick={() => {setCartOpen(false);scrollTo("products");}}>{t.view}</button></div> : cart.map((item) => <article key={item.key}><div className="ex-cart-thumb"><NotebookVisual color={item.leatherHex} passport={item.size === "Passport"}/></div><div><h3>{item.productName}</h3><p>{item.size} · {item.leatherName} · {item.threadName} · {t[item.paper]}</p><strong>{formatUzs(item.price)}</strong><div className="ex-qty"><button type="button" onClick={() => changeQuantity(item.key,-1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.key,1)}>+</button><button type="button" onClick={() => setCart((current) => current.filter((line) => line.key !== item.key))}>{t.remove}</button></div></div></article>)}</div>{cart.length ? <footer><div><span>{t.total}</span><strong>{formatUzs(cartTotal)}</strong></div><button type="button" onClick={() => {setCartOpen(false);setCheckoutOpen(true);}}>{t.checkout}<span>→</span></button></footer> : null}</aside></div> : null}

      {checkoutOpen ? <div className="ex-overlay" onMouseDown={() => setCheckoutOpen(false)}><section className="ex-checkout" onMouseDown={(event:MouseEvent<HTMLElement>) => event.stopPropagation()} role="dialog" aria-modal="true"><button className="ex-close" type="button" onClick={() => setCheckoutOpen(false)}>×</button><p className="ex-kicker">TELEGRAM ORDER</p><h2>{t.checkoutTitle}</h2><p>{t.checkoutText}</p><form onSubmit={submitOrder} noValidate><label>{t.name} *<input value={customer.name} autoComplete="name" onChange={(event:ChangeEvent<HTMLInputElement>) => setCustomer({...customer,name:event.target.value})}/></label><label>{t.phone} *<input value={customer.phone} inputMode="tel" autoComplete="tel" placeholder="+998" onChange={(event:ChangeEvent<HTMLInputElement>) => setCustomer({...customer,phone:event.target.value})}/></label><label>{t.city} *<input value={customer.city} onChange={(event:ChangeEvent<HTMLInputElement>) => setCustomer({...customer,city:event.target.value})}/></label><label>{t.address}<input value={customer.address} onChange={(event:ChangeEvent<HTMLInputElement>) => setCustomer({...customer,address:event.target.value})}/></label><label className="ex-full">{t.comment}<textarea rows={3} value={customer.comment} onChange={(event:ChangeEvent<HTMLTextAreaElement>) => setCustomer({...customer,comment:event.target.value})}/></label>{error ? <p className="ex-error ex-full">{error}</p> : null}<div className="ex-checkout-total ex-full"><span>{t.total}</span><strong>{formatUzs(cartTotal)}</strong></div><button className="ex-full" type="submit">{t.send}<span>→</span></button></form></section></div> : null}
    </main>
  );
}
