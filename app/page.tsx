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

const TELEGRAM_ORDER = "thatswriter";
const TELEGRAM_CHANNEL = "silentscriptuz";
const CART_KEY = "silent-script-cart-v4";
const LOCALE_KEY = "silent-script-locale";

const ui = {
  uz: {
    currency: "so‘m", home: "Bosh sahifa", shop: "Do‘kon", covers: "Charm g‘iloflar", notebooks: "Bloknotlar", about: "Brend haqida",
    eyebrow: "CHARM · QOG‘OZ · XOTIRJAMLIK", title: "Fikrlaringiz uchun charm g‘iloflar va bloknotlar.",
    intro: "Tabiiy charm g‘ilofni alohida yoki almashtiriladigan ichki daftar bilan tanlang. Rang, sahifa turi va bitta bosh harfni o‘zingiz moslang.",
    see: "Mahsulotlarni ko‘rish", order: "Telegram orqali buyurtma", collection: "SILENT COLLECTION", collectionTitle: "Uzoq vaqt siz bilan qoladigan buyumlar.",
    collectionText: "G‘ilof, ichki daftar va personalizatsiyani bitta joyda tanlang. Narx har bir tanlovga qarab avtomatik yangilanadi.",
    all: "Barchasi", cover: "Charm g‘iloflar", notebook: "Ichki daftarlar", set: "To‘plamlar", customize: "Tanlash", from: "dan",
    color: "Charm rangi", insert: "Ichiga daftar qo‘shilsinmi?", yesInsert: "Ha, daftar bilan", noInsert: "Yo‘q, faqat g‘ilof",
    page: "Sahifa turi", pages: { lined: "Chiziqli", dotted: "Nuqtali", grid: "Katakli", blank: "Oq" },
    initial: "Muqovadagi bosh harf", initialHint: "Faqat 1 ta harf. Ixtiyoriy.", gift: "Sovg‘a qutisi", yes: "Ha", no: "Yo‘q",
    add: "Savatga qo‘shish", total: "Jami", cart: "Savat", empty: "Savatingiz hozircha bo‘sh.", remove: "Olib tashlash",
    checkout: "Buyurtmani rasmiylashtirish", name: "Ismingiz", phone: "Telefon raqamingiz", address: "Manzil", comment: "Izoh",
    required: "Ism va telefon raqamini kiriting.", send: "@thatswriter ga yuborish", close: "Yopish",
    why: "NEGA SILENT SCRIPT", whyTitle: "Bitta g‘ilof — ko‘p yangi sahifalar.", whyText: "Daftar tugagach, charm g‘ilof o‘zida qoladi. Faqat ichki daftarni almashtirasiz.",
    benefits: [["Tabiiy charm", "Vaqt o‘tishi bilan o‘ziga xos patina hosil qiladi."], ["Almashtiriladigan daftar", "A5 yoki A6 refill tugagach yangisini qo‘yasiz."], ["Bitta bosh harf", "Minimal va xotirjam personalizatsiya."], ["Qulay buyurtma", "Barcha tanlovlar Telegram xabariga avtomatik tushadi."]],
    footer: "Charm g‘iloflar, almashtiriladigan bloknotlar va xotirjam yozuv uchun puxta o‘ylangan detallar.", admin: "Admin panel",
    greeting: "Assalomu alaykum! Silent Script’dan quyidagi buyurtmani bermoqchiman:", onlyCover: "faqat g‘ilof", withInsert: "ichki daftar bilan",
  },
  en: {
    currency: "UZS", home: "Home", shop: "Shop", covers: "Leather covers", notebooks: "Notebooks", about: "About",
    eyebrow: "LEATHER · PAPER · CALM", title: "Leather covers and notebooks made for your thoughts.",
    intro: "Choose a natural leather cover alone or with a replaceable notebook insert. Personalize the colour, page style and one initial.",
    see: "Explore products", order: "Order via Telegram", collection: "SILENT COLLECTION", collectionTitle: "Objects designed to stay with you.",
    collectionText: "Choose the cover, notebook insert and personalization in one place. The price updates with every option.",
    all: "All", cover: "Leather covers", notebook: "Notebook inserts", set: "Gift sets", customize: "Customize", from: "from",
    color: "Leather colour", insert: "Add a notebook insert?", yesInsert: "Yes, with insert", noInsert: "No, cover only",
    page: "Page style", pages: { lined: "Lined", dotted: "Dotted", grid: "Grid", blank: "Blank" },
    initial: "Cover initial", initialHint: "One letter only. Optional.", gift: "Gift box", yes: "Yes", no: "No",
    add: "Add to cart", total: "Total", cart: "Cart", empty: "Your cart is empty.", remove: "Remove",
    checkout: "Continue to order", name: "Your name", phone: "Phone number", address: "Address", comment: "Note",
    required: "Enter your name and phone number.", send: "Send to @thatswriter", close: "Close",
    why: "WHY SILENT SCRIPT", whyTitle: "One cover — many new pages.", whyText: "When the notebook is full, keep the leather cover and replace only the insert.",
    benefits: [["Natural leather", "It develops a unique patina over time."], ["Replaceable insert", "Replace the A5 or A6 notebook when it is full."], ["One initial", "Minimal and calm personalization."], ["Easy ordering", "Every option is added to the Telegram message automatically."]],
    footer: "Leather covers, replaceable notebooks and thoughtful details for calm writing.", admin: "Admin panel",
    greeting: "Hello! I would like to place the following Silent Script order:", onlyCover: "cover only", withInsert: "with notebook insert",
  },
  ru: {
    currency: "сум", home: "Главная", shop: "Магазин", covers: "Кожаные обложки", notebooks: "Блокноты", about: "О бренде",
    eyebrow: "КОЖА · БУМАГА · СПОКОЙСТВИЕ", title: "Кожаные обложки и блокноты для ваших мыслей.",
    intro: "Выберите обложку отдельно или со сменным блокнотом. Настройте цвет, тип страниц и одну персональную букву.",
    see: "Смотреть товары", order: "Заказать в Telegram", collection: "SILENT COLLECTION", collectionTitle: "Вещи, которые остаются с вами надолго.",
    collectionText: "Выберите обложку, сменный блокнот и персонализацию. Цена меняется автоматически.",
    all: "Все", cover: "Кожаные обложки", notebook: "Сменные блокноты", set: "Наборы", customize: "Настроить", from: "от",
    color: "Цвет кожи", insert: "Добавить блокнот внутрь?", yesInsert: "Да, со сменным блокнотом", noInsert: "Нет, только обложка",
    page: "Тип страниц", pages: { lined: "Линейка", dotted: "Точки", grid: "Клетка", blank: "Чистые" },
    initial: "Буква на обложке", initialHint: "Только одна буква. Необязательно.", gift: "Подарочная коробка", yes: "Да", no: "Нет",
    add: "Добавить в корзину", total: "Итого", cart: "Корзина", empty: "Корзина пока пуста.", remove: "Удалить",
    checkout: "Оформить заказ", name: "Ваше имя", phone: "Номер телефона", address: "Адрес", comment: "Комментарий",
    required: "Введите имя и номер телефона.", send: "Отправить @thatswriter", close: "Закрыть",
    why: "ПОЧЕМУ SILENT SCRIPT", whyTitle: "Одна обложка — много новых страниц.", whyText: "Когда блокнот закончится, сохраните обложку и замените только внутренний блок.",
    benefits: [["Натуральная кожа", "Со временем приобретает уникальную патину."], ["Сменный блокнот", "Замените A5 или A6 после заполнения."], ["Одна буква", "Минималистичная персонализация."], ["Удобный заказ", "Все параметры автоматически добавляются в Telegram." ]],
    footer: "Кожаные обложки, сменные блокноты и продуманные детали для спокойных записей.", admin: "Админ-панель",
    greeting: "Здравствуйте! Хочу оформить следующий заказ Silent Script:", onlyCover: "только обложка", withInsert: "со сменным блокнотом",
  },
} as const;

type CategoryFilter = "all" | ProductCategory;
type Customer = { name: string; phone: string; address: string; comment: string };

function Language({ locale, onChange }: { locale: Locale; onChange: (value: Locale) => void }) {
  return <div className="ss-language">{(["uz", "en", "ru"] as Locale[]).map((item) => <button type="button" key={item} className={item === locale ? "active" : ""} onClick={() => onChange(item)}>{item.toUpperCase()}</button>)}</div>;
}

function ProductImage({ product, locale }: { product: CatalogProduct; locale: Locale }) {
  const [failed, setFailed] = useState(false);
  return failed || !product.image ? <div className="ss-fallback" style={{ background: `linear-gradient(145deg, ${product.colors[0]?.hex ?? "#765343"}, #2f241d)` }}><span>silent script.</span></div> : <img src={product.image} alt={product.name[locale]} onError={() => setFailed(true)} />;
}

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("uz");
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [configuration, setConfiguration] = useState<CartConfiguration>({ colorId: "", includeNotebook: true, pageType: "lined", initial: "", giftBox: false });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", address: "", comment: "" });
  const [error, setError] = useState("");
  const t = ui[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    if (storedLocale === "uz" || storedLocale === "en" || storedLocale === "ru") setLocale(storedLocale);
    try { const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); if (Array.isArray(saved)) setCart(saved); } catch { localStorage.removeItem(CART_KEY); }
    fetch("/api/catalog", { cache: "no-store" }).then((r) => r.json()).then((data: unknown) => { if (isCatalog(data)) setCatalog(data); }).catch(() => undefined);
  }, []);

  useEffect(() => { localStorage.setItem(LOCALE_KEY, locale); document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const products = useMemo(() => catalog.products.filter((p) => p.active && (category === "all" || p.category === category)), [catalog, category]);
  const featured = catalog.products.find((p) => p.active && p.featured) ?? catalog.products.find((p) => p.active);
  const selectedPrice = selected ? productPrice(selected, configuration) : 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function openProduct(product: CatalogProduct) {
    setSelected(product);
    setConfiguration({ colorId: product.colors[0]?.id ?? "", includeNotebook: product.supportsInsert, pageType: product.pageType ?? "lined", initial: "", giftBox: false });
  }

  function addToCart() {
    if (!selected) return;
    const config = { ...configuration };
    const key = [selected.id, config.colorId, config.includeNotebook ? "insert" : "cover", config.pageType, config.initial || "none", config.giftBox ? "gift" : "standard"].join("-");
    const unitPrice = productPrice(selected, config);
    setCart((current) => {
      const found = current.find((item) => item.key === key);
      return found ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { key, productId: selected.id, quantity: 1, unitPrice, configuration: config }];
    });
    setSelected(null); setCartOpen(true);
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) => current.flatMap((item) => item.key !== key ? [item] : item.quantity + delta <= 0 ? [] : [{ ...item, quantity: item.quantity + delta }]));
  }

  function submitOrder(event: FormEvent) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) { setError(t.required); return; }
    const lines = cart.map((item, index) => {
      const product = catalog.products.find((p) => p.id === item.productId);
      if (!product) return "";
      const color = product.colors.find((c) => c.id === item.configuration.colorId);
      const details = [color?.name[locale], product.size, product.supportsInsert ? (item.configuration.includeNotebook ? `${t.withInsert}, ${t.pages[item.configuration.pageType]}` : t.onlyCover) : null, item.configuration.initial ? `${t.initial}: ${item.configuration.initial}` : null, item.configuration.giftBox ? t.gift : null].filter(Boolean).join(" · ");
      return `${index + 1}. ${product.name[locale]}\n   ${details}\n   ${item.quantity} × ${formatPrice(item.unitPrice, t.currency)}`;
    }).filter(Boolean);
    const text = `${t.greeting}\n\n${lines.join("\n\n")}\n\n${t.total}: ${formatPrice(cartTotal, t.currency)}\n\n${t.name}: ${customer.name}\n${t.phone}: ${customer.phone}${customer.address ? `\n${t.address}: ${customer.address}` : ""}${customer.comment ? `\n${t.comment}: ${customer.comment}` : ""}`;
    window.open(`https://t.me/${TELEGRAM_ORDER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return <main className="ss-site">
    <header className="ss-header"><a className="ss-brand" href="#home"><img src="/brand-avatar.svg" alt="silent script."/><span>silent script.</span></a><nav><a href="#home">{t.home}</a><a href="#shop">{t.shop}</a><a href="#about">{t.about}</a></nav><div className="ss-actions"><Language locale={locale} onChange={setLocale}/><button className="ss-cart-button" type="button" onClick={() => setCartOpen(true)}>Bag <b>{cartCount}</b></button></div></header>

    <section id="home" className="ss-hero"><div className="ss-hero-copy"><p className="ss-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p><div><a className="ss-button primary" href="#shop">{t.see}</a><a className="ss-button ghost" href={`https://t.me/${TELEGRAM_ORDER}`} target="_blank" rel="noreferrer">{t.order}</a></div></div><div className="ss-hero-media">{featured ? <ProductImage product={featured} locale={locale}/> : null}<span>01 / leather collection</span></div></section>

    <section id="shop" className="ss-section"><div className="ss-heading"><div><p className="ss-eyebrow">{t.collection}</p><h2>{t.collectionTitle}</h2></div><p>{t.collectionText}</p></div><div className="ss-filters">{(["all", "cover", "notebook", "set"] as CategoryFilter[]).map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item === "all" ? t.all : t[item]}</button>)}</div><div className="ss-grid">{products.map((product) => <article className="ss-card" key={product.id}><button className="ss-card-image" type="button" onClick={() => openProduct(product)}><ProductImage product={product} locale={locale}/>{product.badge ? <span>{product.badge[locale]}</span> : null}</button><div><small>{product.category === "cover" ? t.cover : product.category === "notebook" ? t.notebook : t.set} · {product.size}</small><h3>{product.name[locale]}</h3><p>{product.description[locale]}</p><footer><strong>{t.from} {formatPrice(product.basePrice, t.currency)}</strong><button type="button" onClick={() => openProduct(product)}>{t.customize} →</button></footer></div></article>)}</div></section>

    <section id="about" className="ss-story"><div><p className="ss-eyebrow">{t.why}</p><h2>{t.whyTitle}</h2><p>{t.whyText}</p></div><div className="ss-benefits">{t.benefits.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <footer className="ss-footer"><div><img src="/brand-avatar.svg" alt="silent script."/><div><h2>silent script.</h2><p>{t.footer}</p></div></div><nav><a href="#shop">{t.shop}</a><a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer">@{TELEGRAM_CHANNEL}</a><a href="/admin">{t.admin}</a></nav></footer>

    {selected ? <div className="ss-overlay" onMouseDown={() => setSelected(null)}><section className="ss-modal" onMouseDown={(e) => e.stopPropagation()}><button className="ss-close" type="button" onClick={() => setSelected(null)}>×</button><div className="ss-modal-image"><ProductImage product={selected} locale={locale}/></div><div className="ss-modal-body"><small>{selected.category === "cover" ? t.cover : t.notebook} · {selected.size}</small><h2>{selected.name[locale]}</h2><p>{selected.description[locale]}</p><label className="ss-label">{t.color}</label><div className="ss-colors">{selected.colors.map((color) => <button type="button" key={color.id} className={configuration.colorId === color.id ? "active" : ""} onClick={() => setConfiguration((c) => ({ ...c, colorId: color.id }))}><i style={{ background: color.hex }}/>{color.name[locale]}</button>)}</div>{selected.supportsInsert ? <><label className="ss-label">{t.insert}</label><div className="ss-choices"><button type="button" className={configuration.includeNotebook ? "active" : ""} onClick={() => setConfiguration((c) => ({ ...c, includeNotebook: true }))}>{t.yesInsert}<small>+ {formatPrice(selected.insertPrice ?? 0, t.currency)}</small></button><button type="button" className={!configuration.includeNotebook ? "active" : ""} onClick={() => setConfiguration((c) => ({ ...c, includeNotebook: false }))}>{t.noInsert}</button></div></> : null}{selected.supportsInsert && configuration.includeNotebook ? <><label className="ss-label">{t.page}</label><div className="ss-pages">{(["lined", "dotted", "grid", "blank"] as PageType[]).map((page) => <button type="button" key={page} className={configuration.pageType === page ? "active" : ""} onClick={() => setConfiguration((c) => ({ ...c, pageType: page }))}>{t.pages[page]}</button>)}</div></> : null}<div className="ss-two"><label><span className="ss-label">{t.initial}</span><input value={configuration.initial} maxLength={1} onChange={(e) => setConfiguration((c) => ({ ...c, initial: normalizeInitial(e.target.value) }))} placeholder="G"/><small>{t.initialHint}</small></label><div><span className="ss-label">{t.gift}</span><div className="ss-pages"><button type="button" className={!configuration.giftBox ? "active" : ""} onClick={() => setConfiguration((c) => ({ ...c, giftBox: false }))}>{t.no}</button><button type="button" className={configuration.giftBox ? "active" : ""} onClick={() => setConfiguration((c) => ({ ...c, giftBox: true }))}>{t.yes}</button></div></div></div><div className="ss-modal-total"><div><span>{t.total}</span><strong>{formatPrice(selectedPrice, t.currency)}</strong></div><button className="ss-button primary" type="button" onClick={addToCart}>{t.add}</button></div></div></section></div> : null}

    {cartOpen ? <div className="ss-overlay" onMouseDown={() => setCartOpen(false)}><aside className="ss-drawer" onMouseDown={(e) => e.stopPropagation()}><header><h2>{t.cart} <sup>{cartCount}</sup></h2><button type="button" onClick={() => setCartOpen(false)}>×</button></header><div className="ss-cart-list">{cart.length === 0 ? <p>{t.empty}</p> : cart.map((item) => { const product = catalog.products.find((p) => p.id === item.productId); if (!product) return null; return <article key={item.key}><div className="ss-cart-img"><ProductImage product={product} locale={locale}/></div><div><h3>{product.name[locale]}</h3><p>{product.size} · {product.supportsInsert ? (item.configuration.includeNotebook ? t.withInsert : t.onlyCover) : ""}</p><strong>{formatPrice(item.unitPrice, t.currency)}</strong><footer><button type="button" onClick={() => changeQuantity(item.key, -1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.key, 1)}>+</button><button type="button" onClick={() => setCart((c) => c.filter((x) => x.key !== item.key))}>{t.remove}</button></footer></div></article>; })}</div>{cart.length ? <footer className="ss-drawer-footer"><div><span>{t.total}</span><strong>{formatPrice(cartTotal, t.currency)}</strong></div><button className="ss-button primary" type="button" onClick={() => { setCartOpen(false); setOrderOpen(true); }}>{t.checkout}</button></footer> : null}</aside></div> : null}

    {orderOpen ? <div className="ss-overlay" onMouseDown={() => setOrderOpen(false)}><section className="ss-order" onMouseDown={(e) => e.stopPropagation()}><button className="ss-close" type="button" onClick={() => setOrderOpen(false)}>×</button><p className="ss-eyebrow">TELEGRAM</p><h2>{t.order}</h2><form onSubmit={submitOrder}><label>{t.name} *<input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })}/></label><label>{t.phone} *<input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+998"/></label><label>{t.address}<input value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })}/></label><label>{t.comment}<textarea value={customer.comment} onChange={(e) => setCustomer({ ...customer, comment: e.target.value })}/></label>{error ? <p className="ss-error">{error}</p> : null}<button className="ss-button primary" type="submit">{t.send}</button></form></section></div> : null}

    <style jsx global>{`
      :root{--ss-bg:#f5f0e7;--ss-paper:#fbf8f2;--ss-ink:#2e251f;--ss-muted:#756c63;--ss-green:#626b49;--ss-brown:#66493b;--ss-line:rgba(57,44,35,.16)}
      *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--ss-bg);color:var(--ss-ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.ss-site button,.ss-site input,.ss-site textarea{font:inherit}.ss-site button{color:inherit}.ss-site a{color:inherit;text-decoration:none}.ss-site img{display:block;width:100%;height:100%;object-fit:cover}.ss-header{height:76px;position:sticky;top:0;z-index:40;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 max(24px,calc((100vw - 1180px)/2));background:rgba(245,240,231,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--ss-line)}.ss-brand{display:flex;align-items:center;gap:12px;font:600 27px Georgia,serif}.ss-brand img{width:38px;height:38px;border-radius:6px}.ss-header nav{display:flex;gap:28px;font-size:13px}.ss-actions{justify-self:end;display:flex;align-items:center;gap:13px}.ss-language{display:flex;border:1px solid var(--ss-line);padding:3px}.ss-language button{border:0;background:transparent;padding:7px 8px;font-size:10px;cursor:pointer}.ss-language button.active{background:var(--ss-green);color:white}.ss-cart-button{border:0;background:transparent;cursor:pointer}.ss-cart-button b{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:4px;border-radius:20px;background:var(--ss-green);color:white;font-size:10px}.ss-hero{min-height:calc(100vh - 76px);display:grid;grid-template-columns:.9fr 1.1fr;align-items:center;gap:55px;width:min(1180px,calc(100% - 48px));margin:auto;padding:55px 0}.ss-hero-copy h1,.ss-heading h2,.ss-story h2,.ss-modal h2,.ss-order h2{font:400 clamp(42px,5.5vw,76px)/1 Georgia,serif;letter-spacing:-.045em;margin:0 0 24px}.ss-hero-copy>p:not(.ss-eyebrow){max-width:560px;color:var(--ss-muted);font-size:17px;line-height:1.75}.ss-eyebrow{font-size:11px;font-weight:800;letter-spacing:.16em;color:var(--ss-green);margin:0 0 16px}.ss-hero-copy>div{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.ss-button{min-height:48px;padding:0 20px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--ss-ink);background:transparent;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}.ss-button.primary{background:var(--ss-green);border-color:var(--ss-green);color:white}.ss-button.ghost{background:transparent}.ss-hero-media{height:650px;position:relative;overflow:hidden;background:#d8c7b3}.ss-hero-media span{position:absolute;right:18px;bottom:16px;padding:8px 10px;background:rgba(255,255,255,.85);font-size:10px;letter-spacing:.1em}.ss-fallback{width:100%;height:100%;display:grid;place-items:center;color:white;font:600 25px Georgia,serif}.ss-section{width:min(1180px,calc(100% - 48px));margin:auto;padding:110px 0}.ss-heading{display:grid;grid-template-columns:1.2fr .8fr;gap:50px;align-items:end}.ss-heading h2,.ss-story h2{font-size:clamp(38px,4.5vw,58px)}.ss-heading>p{color:var(--ss-muted);line-height:1.75}.ss-filters{display:flex;gap:8px;flex-wrap:wrap;margin:38px 0 28px}.ss-filters button{padding:10px 15px;border:1px solid var(--ss-line);background:transparent;cursor:pointer}.ss-filters button.active{background:var(--ss-green);color:white}.ss-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:34px 18px}.ss-card-image{width:100%;aspect-ratio:1/1.06;position:relative;padding:0;border:0;background:#ddd0bf;overflow:hidden;cursor:pointer}.ss-card-image>span{position:absolute;left:12px;top:12px;padding:7px 9px;background:var(--ss-paper);font-size:9px;font-weight:800;text-transform:uppercase}.ss-card>div{padding-top:17px}.ss-card small{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ss-green)}.ss-card h3{font:400 25px Georgia,serif;margin:8px 0}.ss-card p{color:var(--ss-muted);line-height:1.6;font-size:14px;min-height:67px}.ss-card footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--ss-line);padding-top:14px}.ss-card footer strong{font-size:13px}.ss-card footer button{border:0;background:transparent;font-size:11px;font-weight:800;cursor:pointer}.ss-story{padding:110px max(24px,calc((100vw - 1180px)/2));background:#5f6949;color:white;display:grid;grid-template-columns:.9fr 1.1fr;gap:80px}.ss-story>div>p:not(.ss-eyebrow){line-height:1.8;color:rgba(255,255,255,.75)}.ss-story .ss-eyebrow{color:#dbe2c6}.ss-benefits{display:grid;grid-template-columns:1fr 1fr}.ss-benefits article{padding:25px;border-left:1px solid rgba(255,255,255,.2);border-bottom:1px solid rgba(255,255,255,.2)}.ss-benefits span{font-size:10px;opacity:.6}.ss-benefits h3{font:400 22px Georgia,serif}.ss-benefits p{font-size:13px;line-height:1.6;opacity:.75}.ss-footer{padding:65px max(24px,calc((100vw - 1180px)/2));background:#2f2925;color:white;display:flex;justify-content:space-between;gap:50px}.ss-footer>div{display:flex;gap:20px;max-width:610px}.ss-footer img{width:86px;height:86px;border-radius:8px}.ss-footer h2{font:400 34px Georgia,serif;margin:0 0 9px}.ss-footer p{color:rgba(255,255,255,.65);line-height:1.7}.ss-footer nav{display:flex;flex-direction:column;gap:12px;font-size:13px}.ss-overlay{position:fixed;inset:0;z-index:100;background:rgba(24,20,17,.64);display:grid;place-items:center;padding:20px}.ss-modal{width:min(1040px,100%);max-height:94vh;overflow:auto;background:var(--ss-paper);display:grid;grid-template-columns:.9fr 1.1fr;position:relative}.ss-close{position:absolute;right:14px;top:14px;z-index:3;width:38px;height:38px;border:0;border-radius:50%;background:white;font-size:24px;cursor:pointer}.ss-modal-image{min-height:650px;background:#d8c7b3}.ss-modal-body{padding:58px}.ss-modal-body>small{font-size:10px;letter-spacing:.1em;color:var(--ss-green)}.ss-modal-body h2{font-size:44px;margin-top:10px}.ss-modal-body>p{color:var(--ss-muted);line-height:1.7}.ss-label{display:block;margin:24px 0 9px;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.ss-colors,.ss-pages,.ss-choices{display:flex;gap:8px;flex-wrap:wrap}.ss-colors button,.ss-pages button,.ss-choices button{border:1px solid var(--ss-line);background:transparent;padding:10px 12px;cursor:pointer}.ss-colors button{display:flex;align-items:center;gap:7px}.ss-colors i{width:18px;height:18px;border-radius:50%}.ss-colors button.active,.ss-pages button.active,.ss-choices button.active{border-color:var(--ss-green);box-shadow:inset 0 0 0 1px var(--ss-green)}.ss-choices button{flex:1;display:flex;flex-direction:column;align-items:flex-start}.ss-choices small{color:var(--ss-muted);margin-top:5px}.ss-two{display:grid;grid-template-columns:1fr 1fr;gap:20px}.ss-two input{width:72px;height:48px;text-align:center;font:400 25px Georgia,serif;border:1px solid var(--ss-line);background:white}.ss-two label small{display:block;color:var(--ss-muted);font-size:10px;margin-top:6px}.ss-modal-total{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--ss-line);margin-top:30px;padding-top:22px}.ss-modal-total div{display:flex;flex-direction:column}.ss-modal-total strong{font:400 27px Georgia,serif}.ss-drawer{position:absolute;right:0;top:0;height:100%;width:min(480px,100%);background:var(--ss-paper);display:flex;flex-direction:column}.ss-drawer>header{display:flex;justify-content:space-between;padding:25px;border-bottom:1px solid var(--ss-line)}.ss-drawer h2{font:400 31px Georgia,serif;margin:0}.ss-drawer header button{border:0;background:transparent;font-size:25px}.ss-cart-list{flex:1;overflow:auto;padding:20px}.ss-cart-list>article{display:grid;grid-template-columns:105px 1fr;gap:15px;padding:15px 0;border-bottom:1px solid var(--ss-line)}.ss-cart-img{height:125px}.ss-cart-list h3{font:400 19px Georgia,serif;margin:0 0 7px}.ss-cart-list p{font-size:12px;color:var(--ss-muted)}.ss-cart-list footer{display:flex;align-items:center;gap:8px;margin-top:12px}.ss-cart-list footer button{border:1px solid var(--ss-line);background:transparent;min-width:28px;height:28px;cursor:pointer}.ss-cart-list footer button:last-child{border:0;margin-left:auto;font-size:10px}.ss-drawer-footer{padding:22px;border-top:1px solid var(--ss-line)}.ss-drawer-footer>div{display:flex;justify-content:space-between;margin-bottom:16px}.ss-drawer-footer strong{font:400 25px Georgia,serif}.ss-drawer-footer .ss-button{width:100%}.ss-order{width:min(560px,100%);background:var(--ss-paper);padding:48px;position:relative}.ss-order h2{font-size:44px}.ss-order form{display:grid;gap:13px}.ss-order label{display:grid;gap:6px;font-size:11px;font-weight:700}.ss-order input,.ss-order textarea{width:100%;border:1px solid var(--ss-line);background:white;padding:12px}.ss-order textarea{min-height:90px;resize:vertical}.ss-order .ss-button{width:100%}.ss-error{color:#9d3328;font-size:12px}
      @media(max-width:900px){.ss-header{grid-template-columns:1fr auto}.ss-header nav{display:none}.ss-hero{grid-template-columns:1fr;padding-top:60px}.ss-hero-media{height:560px}.ss-grid{grid-template-columns:1fr 1fr}.ss-heading,.ss-story{grid-template-columns:1fr}.ss-modal{grid-template-columns:1fr}.ss-modal-image{min-height:430px}.ss-modal-body{padding:35px}}
      @media(max-width:620px){.ss-header{height:68px;padding:0 16px}.ss-brand span{font-size:22px}.ss-brand img{width:34px;height:34px}.ss-language{display:none}.ss-hero,.ss-section{width:calc(100% - 28px)}.ss-hero{gap:28px;padding:40px 0}.ss-hero-copy h1{font-size:45px}.ss-hero-media{height:470px}.ss-section{padding:75px 0}.ss-grid{grid-template-columns:1fr}.ss-card p{min-height:0}.ss-story{padding:75px 18px;gap:40px}.ss-benefits{grid-template-columns:1fr}.ss-footer{flex-direction:column;padding:55px 18px}.ss-footer>div{flex-direction:column}.ss-modal-body{padding:28px 20px}.ss-modal-image{min-height:360px}.ss-two{grid-template-columns:1fr}.ss-modal-total{align-items:flex-end}.ss-order{padding:42px 20px}.ss-overlay{padding:8px}.ss-actions{gap:4px}}
    `}</style>
  </main>;
}
