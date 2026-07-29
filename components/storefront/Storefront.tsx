"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent, type MouseEvent } from "react";
import defaultCatalog from "@/data/catalog.json";
import { formatPrice, isCatalog, normalizeInitial, productPrice, type CartConfiguration, type CartItem, type Catalog, type CatalogProduct, type Locale, type PageType, type ProductCategory } from "@/lib/catalog";
import { ui } from "./copy";
import styles from "./styles";
import { ArrowIcon, BagIcon, CloseIcon, GiftIcon, HandIcon, LeafIcon, MenuIcon, MinusIcon, PlusIcon, ShieldIcon, TelegramIcon } from "./icons";

const TELEGRAM_ORDER = "thatswriter";
const TELEGRAM_CHANNEL = "silentscriptuz";
const CART_KEY = "silent-script-cart-v7";
const LOCALE_KEY = "silent-script-locale";
const HERO_IMAGE = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=88";

type CategoryFilter = "all" | ProductCategory;
type Customer = { name: string; phone: string; city: string; address: string; comment: string };
const pageTypes: PageType[] = ["lined", "dotted", "grid", "blank"];
const categories: CategoryFilter[] = ["all", "cover", "notebook", "set"];
const trustIcons = [LeafIcon, HandIcon, GiftIcon, ShieldIcon];

function productConfiguration(product: CatalogProduct): CartConfiguration {
  return { colorId: product.colors[0]?.id ?? "", includeNotebook: product.supportsInsert, pageType: product.pageType ?? "lined", initial: "", giftBox: false };
}

function LanguageSwitcher({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return <div className={styles.language} aria-label="Til">{(["uz", "ru"] as Locale[]).map((item) => <button type="button" key={item} className={item === locale ? styles.languageActive : ""} onClick={() => onChange(item)} aria-pressed={item === locale}>{item.toUpperCase()}</button>)}</div>;
}

function ProductImage({ product, locale, eager = false }: { product: CatalogProduct; locale: Locale; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const fallback = product.colors[0]?.hex ?? "#6c4e3b";
  if (!product.image || failed) return <div className={styles.imageFallback} style={{ background: `linear-gradient(145deg, ${fallback}, #28221e)` }}><span>silent script.</span></div>;
  return <img src={product.image} alt={product.name[locale]} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
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
  const [customer, setCustomer] = useState<Customer>({ name: "", phone: "", city: "", address: "", comment: "" });
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const t = ui[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    if (storedLocale === "uz" || storedLocale === "ru") setLocale(storedLocale);
    try { const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); if (Array.isArray(saved)) setCart(saved); } catch { localStorage.removeItem(CART_KEY); }
    fetch("/api/catalog", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((data: unknown) => { if (isCatalog(data)) setCatalog(data); }).catch(() => undefined).finally(() => setHydrated(true));
  }, []);
  useEffect(() => { localStorage.setItem(LOCALE_KEY, locale); document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { document.body.style.overflow = selected || cartOpen || orderOpen || menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [selected, cartOpen, orderOpen, menuOpen]);

  const activeProducts = useMemo(() => catalog.products.filter((p) => p.active), [catalog]);
  const products = useMemo(() => activeProducts.filter((p) => category === "all" || p.category === category), [activeProducts, category]);
  const coverProducts = useMemo(() => activeProducts.filter((p) => p.category === "cover" && p.supportsInsert), [activeProducts]);
  const featured = activeProducts.find((p) => p.featured) ?? activeProducts[0];
  const builderProduct = coverProducts.find((p) => p.id === builderProductId) ?? coverProducts[0] ?? featured;
  const selectedPrice = selected ? productPrice(selected, configuration) : 0;
  const builderPrice = builderProduct ? productPrice(builderProduct, builderConfiguration) : 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  useEffect(() => { if (builderProduct) { setBuilderProductId((v) => v || builderProduct.id); setBuilderConfiguration((v) => builderProduct.colors.some((c) => c.id === v.colorId) ? v : productConfiguration(builderProduct)); } }, [builderProduct]);

  function addItem(product: CatalogProduct, config: CartConfiguration) {
    const normalized = { ...config, initial: normalizeInitial(config.initial) };
    const unitPrice = productPrice(product, normalized);
    const key = [product.id, normalized.colorId, normalized.includeNotebook ? "insert" : "cover", normalized.pageType, normalized.initial || "none", normalized.giftBox ? "gift" : "standard"].join("-");
    setCart((current) => { const found = current.find((i) => i.key === key); return found ? current.map((i) => i.key === key ? { ...i, quantity: i.quantity + 1 } : i) : [...current, { key, productId: product.id, quantity: 1, unitPrice, configuration: normalized }]; });
    setSelected(null); setCartOpen(true);
  }

  function changeQuantity(key: string, delta: number) { setCart((current) => current.flatMap((item) => item.key !== key ? [item] : item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : [])); }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim()) { setError(locale === "uz" ? "Ism, telefon va shaharni kiriting." : "Введите имя, телефон и город."); return; }
    if (!cart.length) { setError(t.empty); return; }
    const lines = cart.map((item, index) => {
      const product = catalog.products.find((p) => p.id === item.productId); if (!product) return "";
      const color = product.colors.find((c) => c.id === item.configuration.colorId);
      const details = [color?.name[locale], product.size, product.supportsInsert ? (item.configuration.includeNotebook ? `${t.withInsert}, ${t.pages[item.configuration.pageType]}` : t.onlyCover) : null, item.configuration.initial ? `${t.initial}: ${item.configuration.initial}` : null, item.configuration.giftBox ? t.gift : null].filter(Boolean).join(" · ");
      return `${index + 1}. ${product.name[locale]}\n   ${details}\n   ${item.quantity} × ${formatPrice(item.unitPrice, t.currency)}`;
    }).filter(Boolean);
    const text = `${t.greeting}\n\n${lines.join("\n\n")}\n\n${t.total}: ${formatPrice(cartTotal, t.currency)}\n\n${t.name}: ${customer.name}\n${t.phone}: ${customer.phone}\n${locale === "uz" ? "Shahar" : "Город"}: ${customer.city}${customer.address ? `\n${t.address}: ${customer.address}` : ""}${customer.comment ? `\n${t.comment}: ${customer.comment}` : ""}\n\n${locale === "uz" ? "Yetkazib berish xaridor tomonidan to‘lanadi." : "Доставка оплачивается покупателем."}`;
    try { await navigator.clipboard.writeText(text); } catch { }
    window.open(`https://t.me/${TELEGRAM_ORDER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setError("");
  }

  return <main className={styles.site}>
    <div className={styles.announcement}><span>{locale === "uz" ? "Yetkazib berish xaridor tomonidan to‘lanadi" : "Доставка оплачивается покупателем"}</span><span>{t.announcementNote}</span><a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer"><TelegramIcon size={15}/> @{TELEGRAM_CHANNEL}</a></div>
    <header className={styles.header}><a className={styles.brand} href="#home"><span className={styles.brandMark}/><span>silent script.</span></a><nav className={styles.desktopNav}><a href="#catalog">{t.shop}</a><a href="#story">{t.about}</a><a href="#builder">{t.builder}</a><a href="#process">{t.processNav}</a><a href="#reviews">{locale === "uz" ? "Otzivlar" : "Отзывы"}</a></nav><div className={styles.headerActions}><LanguageSwitcher locale={locale} onChange={setLocale}/><button className={styles.cartButton} onClick={() => setCartOpen(true)}><BagIcon size={21}/><span>{cartCount}</span></button><button className={styles.menuButton} onClick={() => setMenuOpen(true)}><MenuIcon/></button></div></header>
    <section id="home" className={styles.hero}><div className={styles.heroCopy}><p className={styles.eyebrow}>SILENT SCRIPT · HANDMADE</p><h1>{locale === "uz" ? "Har kuni qo‘lga olishni istaydigan kundalik." : "Дневник, который хочется брать в руки каждый день."}</h1><p className={styles.heroText}>{locale === "uz" ? "Sokin fikrlar uchun qo‘lda yaratilgan charm kundaliklar. Har bir dona kichik partiyada va ehtiyotkorlik bilan tayyorlanadi." : "Кожаные дневники ручной работы для спокойных мыслей. Каждый экземпляр создаётся небольшой партией."}</p><div className={styles.heroActions}><a className={`${styles.button} ${styles.buttonPrimary}`} href="#catalog">{t.browse}<ArrowIcon/></a><a className={`${styles.button} ${styles.buttonSecondary}`} href="#builder">{t.create}</a></div><div className={styles.heroMeta}><span><i/> {locale === "uz" ? "Cheklangan nusxa" : "Ограниченный тираж"}</span><span><i/> {locale === "uz" ? "Qo‘l mehnati" : "Ручная работа"}</span><span><i/> A5 · A6</span></div></div><div className={styles.heroMedia}><img src={HERO_IMAGE} alt={locale === "uz" ? "Charm kundalik va ruchka" : "Кожаный дневник и ручка"}/>{featured && <button className={styles.heroProductCard} onClick={() => { setSelected(featured); setConfiguration(productConfiguration(featured)); }}><span>{t.heroProduct}</span><strong>{featured.name[locale]}</strong><small>{formatPrice(featured.basePrice, t.currency)} <ArrowIcon size={15}/></small></button>}</div></section>
    <section className={styles.trustStrip}>{t.trust.map(([title,text]: readonly [string,string],i:number) => { const Icon=trustIcons[i]??ShieldIcon; return <article key={title}><Icon size={25}/><div><h3>{title}</h3><p>{text}</p></div></article>; })}</section>
    <section id="catalog" className={styles.catalogSection}><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>{t.catalogEyebrow}</p><h2>{locale === "uz" ? "Kundaliklar kolleksiyasi." : "Коллекция дневников."}</h2></div><p>{locale === "uz" ? "Tinch ranglar, mustahkam tuzilish va kundalik hayotga mos shakl." : "Спокойные оттенки, прочная конструкция и удобная форма."}</p></div><div className={styles.filters}>{categories.map((item)=><button key={item} className={category===item?styles.filterActive:""} onClick={()=>setCategory(item)}>{item==="all"?t.all:t[item]}</button>)}</div><div className={styles.productGrid}>{products.map((product)=><article className={styles.productCard} key={product.id}><button className={styles.productImage} onClick={()=>{setSelected(product);setConfiguration(productConfiguration(product));}}><ProductImage product={product} locale={locale}/>{product.badge&&<span className={styles.badge}>{product.badge[locale]}</span>}<span className={styles.quickView}>{t.details}<ArrowIcon size={16}/></span></button><div className={styles.productBody}><div className={styles.productTopline}><span>{product.category=== "cover"?t.cover:product.category==="notebook"?t.notebook:t.set}</span><span>{product.size}</span></div><h3>{product.name[locale]}</h3><div className={styles.productPriceRow}><strong>{t.from} {formatPrice(product.basePrice,t.currency)}</strong><span>{product.colors.length} {t.colors}</span></div><div className={styles.swatches}>{product.colors.slice(0,5).map(c=><i key={c.id} style={{background:c.hex}}/>)}</div></div></article>)}</div></section>
    {builderProduct && <section id="builder" className={styles.builderSection}><div className={styles.builderIntro}><p className={styles.eyebrow}>{t.builderEyebrow}</p><h2>{locale === "uz" ? "Kundaligingizni o‘zingiz yarating." : "Создайте свой дневник."}</h2><p>{t.builderText}</p><div className={styles.builderSteps}>{t.builderSteps.map(([title,text]:readonly[string,string],i:number)=><article key={title}><span>{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div><div className={styles.builderCard}><div className={styles.builderPreview} style={{"--preview-color":builderProduct.colors.find(c=>c.id===builderConfiguration.colorId)?.hex??"#6b4b3a"} as CSSProperties}><ProductImage product={builderProduct} locale={locale}/>{builderConfiguration.initial&&<span className={styles.previewInitial}>{builderConfiguration.initial}</span>}<div className={styles.builderPrice}><small>{t.total}</small><strong>{formatPrice(builderPrice,t.currency)}</strong></div></div><div className={styles.builderControls}><div className={styles.controlGroup}><label>{locale==="uz"?"Model":"Модель"}</label><div className={styles.modelChoices}>{coverProducts.map(p=><button key={p.id} className={builderProduct.id===p.id?styles.choiceActive:""} onClick={()=>{setBuilderProductId(p.id);setBuilderConfiguration(productConfiguration(p));}}><span>{p.size}</span>{p.name[locale]}</button>)}</div></div><div className={styles.controlGroup}><label>{t.color}</label><div className={styles.colorChoices}>{builderProduct.colors.map(c=><button key={c.id} className={builderConfiguration.colorId===c.id?styles.colorActive:""} onClick={()=>setBuilderConfiguration(v=>({...v,colorId:c.id}))}><i style={{background:c.hex}}/></button>)}</div></div><div className={styles.controlSplit}><div className={styles.controlGroup}><label>{t.page}</label><div className={styles.segmented}>{pageTypes.map(p=><button key={p} className={builderConfiguration.pageType===p?styles.segmentActive:""} onClick={()=>setBuilderConfiguration(v=>({...v,pageType:p}))}>{t.pages[p]}</button>)}</div></div><div className={styles.controlGroup}><label>{t.initial}</label><input value={builderConfiguration.initial} maxLength={1} onChange={(e:ChangeEvent<HTMLInputElement>)=>setBuilderConfiguration(v=>({...v,initial:normalizeInitial(e.target.value)}))}/></div></div><div className={styles.builderFooter}><label className={styles.checkbox}><input type="checkbox" checked={builderConfiguration.giftBox} onChange={(e)=>setBuilderConfiguration(v=>({...v,giftBox:e.target.checked}))}/><span>{t.gift}</span></label><button className={`${styles.button} ${styles.buttonPrimary}`} onClick={()=>addItem(builderProduct,builderConfiguration)}>{t.add}<BagIcon size={18}/></button></div></div></div></section>}
    <section id="story" className={styles.storySection}><div className={styles.storyVisual}><img src={HERO_IMAGE} alt="Silent Script"/><span>silent script.</span></div><div className={styles.storyCopy}><p className={styles.eyebrow}>{t.storyEyebrow}</p><h2>{locale==="uz"?"Siz bilan vaqt o‘tkazadigan buyum.":"Вещь, которая остаётся с вами."}</h2><p>{t.storyText}</p><a href="#catalog">{t.storyLink}<ArrowIcon/></a></div></section>
    <section id="process" className={styles.processSection}><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>{t.processEyebrow}</p><h2>{t.processTitle}</h2></div></div><div className={styles.processGrid}>{t.process.map(([title,text]:readonly[string,string],i:number)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="reviews" className={styles.faqSection}><div><p className={styles.eyebrow}>{locale==="uz"?"MIJOZLAR FIKRI":"ОТЗЫВЫ"}</p><h2>{locale==="uz"?"Qo‘lda yaratilgan sifat seziladi.":"Качество ручной работы заметно."}</h2></div><div className={styles.faqList}>{(locale==="uz"?[["Madina","Rangi va tikuvlari juda chiroyli. Kundalik qo‘lda tayyorlangani darrov bilinadi."],["Aziza","Sovg‘a uchun buyurtma berdim. Qadoqlanishi ham juda didli chiqdi."],["Kamola","Minimalist, sifatli va kundalik foydalanishga juda qulay."]]:[["Мадина","Цвет и строчка очень красивые. Ручная работа заметна сразу."],["Азиза","Заказывала в подарок. Упаковка тоже получилась очень стильной."],["Камола","Минималистично, качественно и удобно на каждый день."]]).map(([name,text])=><details open key={name}><summary>{name}<span>★★★★★</span></summary><p>{text}</p></details>)}</div></section>
    <footer className={styles.footer}><div className={styles.footerMain}><div className={styles.footerBrand}><a className={styles.brand} href="#home"><span className={styles.brandMark}/><span>silent script.</span></a><p>{t.footerText}</p><a href={`https://t.me/${TELEGRAM_CHANNEL}`} target="_blank" rel="noreferrer"><TelegramIcon/> @{TELEGRAM_CHANNEL}</a></div><div><h3>{t.footerShop}</h3><a href="#catalog">{t.shop}</a><a href="#builder">{t.builder}</a></div><div><h3>{t.footerHelp}</h3><a href={`https://t.me/${TELEGRAM_ORDER}`} target="_blank" rel="noreferrer">@{TELEGRAM_ORDER}</a><a href="/admin">{t.admin}</a></div></div><div className={styles.footerBottom}><span>© 2026 silent script. {t.rights}</span><LanguageSwitcher locale={locale} onChange={setLocale}/></div></footer>
    {menuOpen&&<div className={styles.mobileMenuBackdrop} onMouseDown={()=>setMenuOpen(false)}><aside className={styles.mobileMenu} onMouseDown={(e:MouseEvent<HTMLElement>)=>e.stopPropagation()}><header><span>silent script.</span><button onClick={()=>setMenuOpen(false)}><CloseIcon/></button></header><nav>{[["catalog",t.shop],["builder",t.builder],["story",t.about],["process",t.processNav],["reviews",locale==="uz"?"Otzivlar":"Отзывы"]].map(([id,label])=><button key={id} onClick={()=>{setMenuOpen(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"});}}>{label}<ArrowIcon/></button>)}</nav><LanguageSwitcher locale={locale} onChange={setLocale}/></aside></div>}
    {selected&&<div className={styles.overlay} onMouseDown={()=>setSelected(null)}><section className={styles.productModal} onMouseDown={(e:MouseEvent<HTMLElement>)=>e.stopPropagation()}><button className={styles.closeButton} onClick={()=>setSelected(null)}><CloseIcon/></button><div className={styles.modalImage}><ProductImage product={selected} locale={locale}/></div><div className={styles.modalBody}><div className={styles.productTopline}><span>{selected.size}</span><span>{selected.colors.length} {t.colors}</span></div><h2>{selected.name[locale]}</h2><p>{selected.description[locale]}</p><div className={styles.controlGroup}><label>{t.color}</label><div className={styles.colorChoices}>{selected.colors.map(c=><button key={c.id} className={configuration.colorId===c.id?styles.colorActive:""} onClick={()=>setConfiguration(v=>({...v,colorId:c.id}))}><i style={{background:c.hex}}/></button>)}</div></div>{selected.supportsInsert&&configuration.includeNotebook&&<div className={styles.controlGroup}><label>{t.page}</label><div className={styles.segmented}>{pageTypes.map(p=><button key={p} className={configuration.pageType===p?styles.segmentActive:""} onClick={()=>setConfiguration(v=>({...v,pageType:p}))}>{t.pages[p]}</button>)}</div></div>}<div className={styles.modalFooter}><div><small>{t.total}</small><strong>{formatPrice(selectedPrice,t.currency)}</strong></div><button className={`${styles.button} ${styles.buttonPrimary}`} onClick={()=>addItem(selected,configuration)}>{t.add}<BagIcon size={18}/></button></div></div></section></div>}
    {cartOpen&&<div className={styles.overlay} onMouseDown={()=>setCartOpen(false)}><aside className={styles.cartDrawer} onMouseDown={(e:MouseEvent<HTMLElement>)=>e.stopPropagation()}><header><div><p>{t.cart}</p><h2>{cartCount}</h2></div><button onClick={()=>setCartOpen(false)}><CloseIcon/></button></header><div className={styles.cartList}>{!cart.length?<div className={styles.cartEmpty}><BagIcon size={34}/><h3>{t.empty}</h3><p>{t.emptyText}</p></div>:cart.map(item=>{const p=catalog.products.find(x=>x.id===item.productId);if(!p)return null;return <article key={item.key}><div className={styles.cartThumb}><ProductImage product={p} locale={locale}/></div><div><h3>{p.name[locale]}</h3><p>{p.size}</p><strong>{formatPrice(item.unitPrice,t.currency)}</strong><footer><div><button onClick={()=>changeQuantity(item.key,-1)}><MinusIcon size={15}/></button><span>{item.quantity}</span><button onClick={()=>changeQuantity(item.key,1)}><PlusIcon size={15}/></button></div><button onClick={()=>setCart(v=>v.filter(x=>x.key!==item.key))}>{t.remove}</button></footer></div></article>})}</div>{cart.length>0&&<footer className={styles.cartFooter}><div><span>{t.total}</span><strong>{formatPrice(cartTotal,t.currency)}</strong></div><button className={`${styles.button} ${styles.buttonPrimary}`} onClick={()=>{setCartOpen(false);setOrderOpen(true);}}>{t.checkout}<ArrowIcon/></button></footer>}</aside></div>}
    {orderOpen&&<div className={styles.overlay} onMouseDown={()=>setOrderOpen(false)}><section className={styles.orderModal} onMouseDown={(e:MouseEvent<HTMLElement>)=>e.stopPropagation()}><button className={styles.closeButton} onClick={()=>setOrderOpen(false)}><CloseIcon/></button><p className={styles.eyebrow}>TELEGRAM · @{TELEGRAM_ORDER}</p><h2>{t.orderTitle}</h2><p>{t.orderText}</p><form onSubmit={submitOrder}><label>{t.name} *<input value={customer.name} onChange={e=>setCustomer(v=>({...v,name:e.target.value}))}/></label><label>{t.phone} *<input value={customer.phone} inputMode="tel" placeholder="+998" onChange={e=>setCustomer(v=>({...v,phone:e.target.value}))}/></label><label>{locale==="uz"?"Shahar":"Город"} *<input value={customer.city} onChange={e=>setCustomer(v=>({...v,city:e.target.value}))}/></label><label>{t.address}<input value={customer.address} onChange={e=>setCustomer(v=>({...v,address:e.target.value}))}/></label><label>{t.comment}<textarea value={customer.comment} rows={3} onChange={e=>setCustomer(v=>({...v,comment:e.target.value}))}/></label>{error&&<p className={styles.formError}>{error}</p>}<div className={styles.orderTotal}><span>{t.total}</span><strong>{formatPrice(cartTotal,t.currency)}</strong></div><button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">{t.send}<TelegramIcon size={18}/></button></form></section></div>}
  </main>;
}
