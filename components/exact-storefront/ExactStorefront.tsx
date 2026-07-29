"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent, type MouseEvent, type SyntheticEvent } from "react";
import defaultCatalog from "@/data/catalog.json";
import { isCatalog, type Catalog, type CatalogProduct } from "@/lib/catalog";
import "./exact.css";

type Locale = "uz" | "ru";
type Paper = "cream" | "lined" | "dotted";
type CartLine = {
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

type Customer = {
  name: string;
  phone: string;
  city: string;
  address: string;
  comment: string;
};

const TELEGRAM = "thatswriter";
const CART_KEY = "silent-script-exact-cart-v1";
const LOCALE_KEY = "silent-script-exact-locale";

const copy = {
  uz: {
    delivery: "Yetkazib berish xaridor tomonidan to‘lanadi",
    home: "Bosh sahifa",
    products: "Mahsulotlar",
    builder: "O‘z dizayningizni yarating",
    about: "Biz haqimizda",
    contact: "Aloqa",
    order: "Buyurtma berish",
    eyebrow: "Sokin fikrlar uchun",
    titleA: "Qo‘lda yaratilgan",
    titleB: "kundaliklar.",
    heroText: "Har bir jurnal 100% qo‘l mehnati va barchasini ehtiyotkorlik bilan siz uchun tayyorlanadi.",
    limited: "Har bir kundalik cheklangan nusxada chiqariladi",
    view: "Mahsulotlarni ko‘rish",
    collection: "KUNDALIKLAR",
    choose: "Tanlash",
    design: "O‘Z DIZAYNINGIZNI YARATING",
    size: "O‘lcham",
    leather: "Charm rangi",
    thread: "Ip rangi",
    paper: "Qog‘oz rangi",
    summary: "Tanlangan konfiguratsiya",
    price: "Narx",
    add: "Savatchaga qo‘shish",
    cart: "Savatcha",
    empty: "Savatcha hozircha bo‘sh",
    total: "Jami",
    checkout: "Buyurtmani rasmiylashtirish",
    remove: "Olib tashlash",
    quantity: "Soni",
    checkoutTitle: "Buyurtma ma’lumotlari",
    checkoutText: "Ma’lumotlarni to‘ldiring. Tayyor buyurtma matni @thatswriter chatiga ochiladi.",
    name: "Ism",
    phone: "Telefon raqami",
    city: "Shahar / viloyat",
    address: "Aniq manzil",
    comment: "Qo‘shimcha izoh",
    required: "Ism, telefon raqami va shaharni kiriting.",
    send: "Telegram orqali yuborish",
    close: "Yopish",
    cream: "Krem",
    lined: "Chiziqli",
    dotted: "Nuqtali",
    from: "dan",
    added: "Savatchaga qo‘shildi",
  },
  ru: {
    delivery: "Доставку оплачивает покупатель",
    home: "Главная",
    products: "Товары",
    builder: "Создать свой дизайн",
    about: "О нас",
    contact: "Контакты",
    order: "Оформить заказ",
    eyebrow: "Для спокойных мыслей",
    titleA: "Кожаные ежедневники",
    titleB: "ручной работы.",
    heroText: "Каждый ежедневник полностью создаётся вручную и аккуратно готовится специально для вас.",
    limited: "Каждый ежедневник выпускается ограниченным тиражом",
    view: "Смотреть товары",
    collection: "ЕЖЕДНЕВНИКИ",
    choose: "Выбрать",
    design: "СОЗДАЙТЕ СВОЙ ДИЗАЙН",
    size: "Размер",
    leather: "Цвет кожи",
    thread: "Цвет нити",
    paper: "Бумага",
    summary: "Выбранная конфигурация",
    price: "Цена",
    add: "Добавить в корзину",
    cart: "Корзина",
    empty: "Корзина пока пуста",
    total: "Итого",
    checkout: "Оформить заказ",
    remove: "Удалить",
    quantity: "Количество",
    checkoutTitle: "Данные заказа",
    checkoutText: "Заполните данные. Готовый текст заказа откроется в чате @thatswriter.",
    name: "Имя",
    phone: "Номер телефона",
    city: "Город / область",
    address: "Точный адрес",
    comment: "Комментарий",
    required: "Укажите имя, номер телефона и город.",
    send: "Отправить через Telegram",
    close: "Закрыть",
    cream: "Кремовая",
    lined: "В линейку",
    dotted: "В точку",
    from: "от",
    added: "Добавлено в корзину",
  },
} as const;

const threadOptions = [
  { id: "honey", uz: "Asal", ru: "Медовая", hex: "#d59a3a" },
  { id: "cream", uz: "Krem", ru: "Кремовая", hex: "#ddd7ca" },
  { id: "charcoal", uz: "Grafit", ru: "Графитовая", hex: "#2f3130" },
  { id: "brown", uz: "Jigarrang", ru: "Коричневая", hex: "#6b4127" },
];

const paperOptions: Paper[] = ["cream", "lined", "dotted"];

function formatUzs(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `${safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;
}

function displayName(product: CatalogProduct, locale: Locale): string {
  return product.name[locale] || product.name.uz;
}

function modelSize(product: CatalogProduct): string {
  if (/passport/i.test(product.id) || /passport/i.test(product.name.en)) return "Passport";
  return product.size;
}

function isCustom(product: CatalogProduct, index: number): boolean {
  return product.id.startsWith("custom-") || index >= 3;
}

function NotebookVisual({ color, large = false, passport = false }: { color: string; large?: boolean; passport?: boolean }) {
  return (
    <div
      className={`ex-notebook${large ? " ex-notebook--large" : ""}${passport ? " ex-notebook--passport" : ""}`}
      style={{ "--cover": color } as CSSProperties}
      aria-hidden="true"
    >
      <span className="ex-notebook__spine" />
      <span className="ex-notebook__strap" />
      <span className="ex-notebook__edge" />
    </div>
  );
}

function SideVisual({ color, thread }: { color: string; thread: string }) {
  return (
    <div className="ex-side" style={{ "--cover": color, "--thread": thread } as CSSProperties} aria-hidden="true">
      <i /><i /><i /><i /><span />
    </div>
  );
}

export default function ExactStorefront() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [selectedId, setSelectedId] = useState("");
  const [leatherId, setLeatherId] = useState("");
  const [threadId, setThreadId] = useState(threadOptions[3].id);
  const [paper, setPaper] = useState<Paper>("cream");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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
    } catch {
      localStorage.removeItem(CART_KEY);
    }
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("catalog"))))
      .then((value: unknown) => { if (isCatalog(value)) setCatalog(value); })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, checkoutOpen]);

  const products = useMemo(() => catalog.products.filter((item) => item.active).slice(0, 6), [catalog]);
  const selectedProduct = products.find((item) => item.id === selectedId) || products[3] || products[0];
  const leatherOptions = selectedProduct?.colors?.length ? selectedProduct.colors : [
    { id: "brown", hex: "#6b412f", name: { uz: "Jigarrang", en: "Brown", ru: "Коричневый" } },
  ];
  const selectedLeather = leatherOptions.find((item) => item.id === leatherId) || leatherOptions[0];
  const selectedThread = threadOptions.find((item) => item.id === threadId) || threadOptions[0];
  const selectedPrice = selectedProduct?.basePrice || 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!selectedProduct) return;
    setSelectedId((current) => current || selectedProduct.id);
    if (!selectedProduct.colors.some((color) => color.id === leatherId)) {
      setLeatherId(selectedProduct.colors[0]?.id || "");
    }
  }, [selectedProduct, leatherId]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectProduct(product: CatalogProduct) {
    setSelectedId(product.id);
    setLeatherId(product.colors[0]?.id || "");
    scrollTo("design");
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
      return [...current, {
        key,
        productId: selectedProduct.id,
        productName: displayName(selectedProduct, locale),
        price: selectedPrice,
        quantity: 1,
        size,
        leatherName,
        leatherHex: selectedLeather.hex,
        threadName,
        threadHex: selectedThread.hex,
        paper,
      }];
    });
    setToast(t.added);
    window.setTimeout(() => setToast(""), 1800);
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
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim()) {
      setError(t.required);
      return;
    }
    if (!cart.length) {
      setError(t.empty);
      return;
    }

    const lines = cart.map((item, index) => {
      const paperName = copy[locale][item.paper];
      return [
        `${index + 1}. ${item.productName}`,
        `${t.size}: ${item.size}`,
        `${t.leather}: ${item.leatherName}`,
        `${t.thread}: ${item.threadName}`,
        `${t.paper}: ${paperName}`,
        `${t.quantity}: ${item.quantity}`,
        `${t.price}: ${formatUzs(item.price * item.quantity)}`,
      ].join("\n");
    });

    const message = [
      locale === "uz" ? "Assalomu alaykum! Silent Script’dan buyurtma bermoqchiman:" : "Здравствуйте! Хочу оформить заказ в Silent Script:",
      "",
      lines.join("\n\n"),
      "",
      `${t.total}: ${formatUzs(cartTotal)}`,
      "",
      `${t.name}: ${customer.name}`,
      `${t.phone}: ${customer.phone}`,
      `${t.city}: ${customer.city}`,
      `${t.address}: ${customer.address || "—"}`,
      `${t.comment}: ${customer.comment || "—"}`,
      "",
      t.delivery,
    ].join("\n");

    try { await navigator.clipboard.writeText(message); } catch { /* clipboard is optional */ }
    window.open(`https://t.me/${TELEGRAM}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setError("");
  }

  return (
    <main className="ex-site">
      <div className="ex-topbar">
        <span>▱&nbsp; {t.delivery}</span>
        <div><a href="https://t.me/thatswriter" target="_blank" rel="noreferrer">⌕&nbsp; Telegram: @thatswriter</a><a href="https://instagram.com/silentscriptuz" target="_blank" rel="noreferrer">◎&nbsp; Instagram: @silentscriptuz</a></div>
      </div>

      <header className="ex-header">
        <a className="ex-logo" href="#home">silent script.</a>
        <nav>
          <a href="#home">{t.home}</a>
          <a href="#products">{t.products}</a>
          <a href="#design">{t.builder}</a>
          <a href="#about">{t.about}</a>
          <a href="#contact">{t.contact}</a>
        </nav>
        <div className="ex-actions">
          <button className="ex-language" type="button" onClick={() => setLocale(locale === "uz" ? "ru" : "uz")}>{locale.toUpperCase()}⌄</button>
          <button className="ex-cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={t.cart}>♧<b>{cartCount}</b></button>
          <button className="ex-order-button" type="button" onClick={() => cart.length ? setCheckoutOpen(true) : scrollTo("products")}>{t.order}</button>
        </div>
      </header>

      <section className="ex-hero" id="home">
        <div className="ex-hero__copy">
          <p className="ex-eyebrow">⌁&nbsp; {t.eyebrow}</p>
          <h1>{t.titleA}<br/><em>{t.titleB}</em></h1>
          <p className="ex-hero__text">{t.heroText}</p>
          <p className="ex-limited">◉&nbsp; {t.limited}</p>
          <button type="button" onClick={() => scrollTo("products")}>{t.view}<span>→</span></button>
        </div>
        <div className="ex-hero__photo" role="img" aria-label="Handmade leather journal" />
      </section>

      <section className="ex-products" id="products">
        <div className="ex-section-title"><span/><h2>{t.collection}</h2><span/></div>
        <div className="ex-leaf">⌁</div>
        <div className="ex-product-grid">
          {products.map((product, index) => {
            const color = product.colors[0]?.hex || "#6a4632";
            const custom = isCustom(product, index);
            return (
              <article className="ex-product-card" key={product.id}>
                {index === 0 ? <b className="ex-badge">{locale === "uz" ? "Eng mashhur" : "Популярный"}</b> : null}
                <div className="ex-product-visual">
                  {product.image ? <img src={product.image} alt="" onError={(event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.style.display = "none"; }} /> : null}
                  <NotebookVisual color={color} passport={modelSize(product) === "Passport"}/>
                  {custom ? <span className="ex-plus">+</span> : null}
                </div>
                <h3>{displayName(product, locale)}</h3>
                <p>{formatUzs(product.basePrice)} <small>{t.from}</small></p>
                <button type="button" onClick={() => selectProduct(product)}>{t.choose}</button>
              </article>
            );
          })}
        </div>
      </section>

      {selectedProduct ? (
        <section className="ex-builder" id="design">
          <div className="ex-section-title ex-section-title--builder"><span/><h2>{t.design}</h2><span/></div>
          <div className="ex-builder-grid">
            <div className="ex-options">
              <fieldset>
                <legend>1. {t.size}</legend>
                <div className="ex-size-options">
                  {products.slice(0, 3).map((product) => <button key={product.id} type="button" className={modelSize(selectedProduct) === modelSize(product) ? "is-active" : ""} onClick={() => selectProduct(product)}>{modelSize(product)}</button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend>2. {t.leather}</legend>
                <div className="ex-color-options">
                  {leatherOptions.map((color) => <button key={color.id} type="button" className={selectedLeather.id === color.id ? "is-active" : ""} onClick={() => setLeatherId(color.id)} title={color.name[locale]}><i style={{ background: color.hex }}/></button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend>3. {t.thread}</legend>
                <div className="ex-color-options ex-color-options--thread">
                  {threadOptions.map((thread) => <button key={thread.id} type="button" className={selectedThread.id === thread.id ? "is-active" : ""} onClick={() => setThreadId(thread.id)} title={thread[locale]}><i style={{ background: thread.hex }}/></button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend>4. {t.paper}</legend>
                <div className="ex-paper-options">
                  {paperOptions.map((item) => <button key={item} type="button" className={paper === item ? "is-active" : ""} onClick={() => setPaper(item)}>{t[item]}</button>)}
                </div>
              </fieldset>
            </div>

            <div className="ex-preview">
              <NotebookVisual color={selectedLeather.hex} large passport={modelSize(selectedProduct) === "Passport"}/>
              <SideVisual color={selectedLeather.hex} thread={selectedThread.hex}/>
            </div>

            <aside className="ex-summary">
              <h3>{t.summary}</h3>
              <dl>
                <div><dt>{t.size}:</dt><dd>{modelSize(selectedProduct)}</dd></div>
                <div><dt>{t.leather}:</dt><dd>{selectedLeather.name[locale]}</dd></div>
                <div><dt>{t.thread}:</dt><dd>{selectedThread[locale]}</dd></div>
                <div><dt>{t.paper}:</dt><dd>{t[paper]}</dd></div>
              </dl>
              <p><b>{t.price}: {formatUzs(selectedPrice)}</b> <small>{t.from}</small></p>
              <button type="button" onClick={addToCart}>♧&nbsp; {t.add}</button>
              <small>{t.delivery}</small>
            </aside>
          </div>
        </section>
      ) : null}

      <section className="ex-about" id="about"><h2>{locale === "uz" ? "Sokin yozuvlar uchun puxta yaratilgan." : "Создано для спокойных и важных мыслей."}</h2><p>{locale === "uz" ? "Minimal shakl, tabiiy ranglar va qo‘l mehnati — har bir kundalikni o‘ziga xos qiladi." : "Минималистичная форма, натуральные оттенки и ручная работа делают каждый ежедневник особенным."}</p></section>
      <footer id="contact"><a className="ex-logo" href="#home">silent script.</a><span>© 2026</span><a href="https://t.me/thatswriter" target="_blank" rel="noreferrer">@thatswriter</a></footer>

      {toast ? <div className="ex-toast">{toast}</div> : null}

      {cartOpen ? (
        <div className="ex-overlay" onMouseDown={() => setCartOpen(false)}>
          <aside className="ex-cart" onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <header><h2>{t.cart}</h2><button type="button" onClick={() => setCartOpen(false)}>×</button></header>
            <div className="ex-cart-list">
              {!cart.length ? <p className="ex-empty">{t.empty}</p> : cart.map((item) => (
                <article key={item.key}>
                  <NotebookVisual color={item.leatherHex} passport={item.size === "Passport"}/>
                  <div><h3>{item.productName}</h3><p>{item.size} · {item.leatherName} · {item.threadName}</p><strong>{formatUzs(item.price)}</strong><div className="ex-qty"><button type="button" onClick={() => changeQuantity(item.key, -1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.key, 1)}>+</button><button type="button" onClick={() => setCart((current) => current.filter((line) => line.key !== item.key))}>{t.remove}</button></div></div>
                </article>
              ))}
            </div>
            {cart.length ? <footer><div><span>{t.total}</span><strong>{formatUzs(cartTotal)}</strong></div><button type="button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>{t.checkout}</button></footer> : null}
          </aside>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="ex-overlay" onMouseDown={() => setCheckoutOpen(false)}>
          <section className="ex-checkout" onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <button className="ex-close" type="button" onClick={() => setCheckoutOpen(false)}>×</button>
            <p className="ex-eyebrow">TELEGRAM</p><h2>{t.checkoutTitle}</h2><p>{t.checkoutText}</p>
            <form onSubmit={submitOrder}>
              <label>{t.name} *<input value={customer.name} onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer({ ...customer, name: event.target.value })}/></label>
              <label>{t.phone} *<input value={customer.phone} inputMode="tel" placeholder="+998" onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer({ ...customer, phone: event.target.value })}/></label>
              <label>{t.city} *<input value={customer.city} onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer({ ...customer, city: event.target.value })}/></label>
              <label>{t.address}<input value={customer.address} onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomer({ ...customer, address: event.target.value })}/></label>
              <label className="ex-full">{t.comment}<textarea rows={3} value={customer.comment} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCustomer({ ...customer, comment: event.target.value })}/></label>
              {error ? <p className="ex-error ex-full">{error}</p> : null}
              <div className="ex-checkout-total ex-full"><span>{t.total}</span><strong>{formatUzs(cartTotal)}</strong></div>
              <button className="ex-full" type="submit">{t.send}</button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
