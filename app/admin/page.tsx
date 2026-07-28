"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import defaultCatalog from "@/data/catalog.json";
import { formatPrice, isCatalog, type Catalog, type CatalogColor, type CatalogProduct, type Locale, type ProductCategory } from "@/lib/catalog";

const SESSION_KEY = "silent-script-admin-password";
const locales: Locale[] = ["uz", "en", "ru"];
type Status = { configured: boolean; directPublish: boolean };

function newColor(index: number): CatalogColor {
  return { id: `color-${Date.now()}-${index}`, name: { uz: "Yangi rang", en: "New colour", ru: "Новый цвет" }, hex: "#765343" };
}

function newProduct(index: number): CatalogProduct {
  return {
    id: `new-product-${Date.now()}-${index}`,
    category: "cover",
    active: true,
    featured: false,
    name: { uz: "Yangi charm g‘ilof", en: "New leather cover", ru: "Новая кожаная обложка" },
    description: { uz: "Mahsulot tavsifi", en: "Product description", ru: "Описание товара" },
    basePrice: 100000,
    image: "",
    size: "A5",
    colors: [newColor(0)],
    supportsInsert: true,
    insertPrice: 49000,
    insertPages: 96,
    giftBoxPrice: 25000,
  };
}

async function responseError(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : fallback;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const activeCount = useMemo(() => catalog.products.filter((p) => p.active).length, [catalog]);

  useEffect(() => {
    fetch("/api/admin/status", { cache: "no-store" }).then((r) => r.json()).then((value: unknown) => {
      if (value && typeof value === "object" && "configured" in value) setStatus(value as Status);
    }).catch(() => setStatus({ configured: false, directPublish: false }));
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setPassword(saved);
  }, []);

  async function login() {
    setBusy(true); setError(""); setMessage("");
    try {
      const auth = await fetch("/api/admin/login", { method: "POST", headers: { "x-admin-password": password } });
      if (!auth.ok) throw new Error(await responseError(auth, "Kirish amalga oshmadi."));
      const authData = await auth.json() as { storageConfigured?: boolean };
      const response = await fetch("/api/admin/catalog", { cache: "no-store", headers: { "x-admin-password": password } });
      if (!response.ok) throw new Error(await responseError(response, "Katalog yuklanmadi."));
      const data: unknown = await response.json();
      if (!isCatalog(data)) throw new Error("Katalog formati noto‘g‘ri.");
      setCatalog(data); setAuthenticated(true); sessionStorage.setItem(SESSION_KEY, password);
      setStatus({ configured: Boolean(authData.storageConfigured), directPublish: Boolean(authData.storageConfigured) });
      setMessage(authData.storageConfigured ? "Admin tayyor. Save bosilganda public sayt darhol yangilanadi." : "Admin ochildi. Direct Save uchun Vercel Blob’ni bir marta ulang.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kirish amalga oshmadi."); }
    finally { setBusy(false); }
  }

  function patchProduct(id: string, patch: Partial<CatalogProduct>) {
    setCatalog((current) => ({ ...current, products: current.products.map((p) => p.id === id ? { ...p, ...patch } : p) }));
  }

  function patchText(id: string, field: "name" | "description", locale: Locale, value: string) {
    setCatalog((current) => ({ ...current, products: current.products.map((p) => p.id === id ? { ...p, [field]: { ...p[field], [locale]: value } } : p) }));
  }

  function patchColor(productId: string, colorId: string, patch: Partial<CatalogColor>) {
    setCatalog((current) => ({ ...current, products: current.products.map((p) => p.id === productId ? { ...p, colors: p.colors.map((c) => c.id === colorId ? { ...c, ...patch } : c) } : p) }));
  }

  function patchColorName(productId: string, colorId: string, locale: Locale, value: string) {
    setCatalog((current) => ({ ...current, products: current.products.map((p) => p.id === productId ? { ...p, colors: p.colors.map((c) => c.id === colorId ? { ...c, name: { ...c.name, [locale]: value } } : c) } : p) }));
  }

  async function upload(productId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!status?.configured) { setError("Avval Vercel Blob storage’ni ulang."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024) { setError("JPG, PNG yoki WEBP rasm yuklang. Maksimal 4 MB."); return; }
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-password": password }, body: form });
      if (!response.ok) throw new Error(await responseError(response, "Rasm yuklanmadi."));
      const data = await response.json() as { url?: string };
      if (!data.url) throw new Error("Rasm manzili qaytmadi.");
      patchProduct(productId, { image: data.url }); setMessage("Rasm yuklandi. Endi “Saytga nashr qilish”ni bosing.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Rasm yuklanmadi."); }
    finally { setBusy(false); }
  }

  async function publish() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/catalog", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify(catalog) });
      if (!response.ok) throw new Error(await responseError(response, "Katalog saqlanmadi."));
      const data = await response.json() as { catalog?: unknown };
      if (!isCatalog(data.catalog)) throw new Error("Saqlangan katalog qaytmadi.");
      setCatalog(data.catalog); setMessage("Nashr qilindi. Public saytni yangilasangiz o‘zgarishlar ko‘rinadi.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Katalog saqlanmadi."); }
    finally { setBusy(false); }
  }

  if (!authenticated) return <main className="sa-login"><section><a href="/" className="sa-brand"><img src="/brand-avatar.svg" alt="silent script."/><span>silent script.</span></a><p className="sa-kicker">PRIVATE ADMIN</p><h1>Katalog boshqaruvi</h1><p>Mahsulotlar, rasmlar, narxlar va ranglarni boshqaring.</p><label>Admin parol<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void login(); }} autoComplete="current-password"/></label>{status && !status.configured ? <div className="sa-warning">Direct Save kodi tayyor. Vercel Blob storage hali ulanmagan.</div> : null}{error ? <div className="sa-error">{error}</div> : null}<button type="button" onClick={() => void login()} disabled={busy || !password}>{busy ? "Tekshirilmoqda..." : "Kirish"}</button></section><AdminStyles/></main>;

  return <main className="sa-dashboard"><header><a href="/" className="sa-brand"><img src="/brand-avatar.svg" alt="silent script."/><span>silent script.</span></a><div><span>{activeCount} ta faol mahsulot</span><a href="/" target="_blank">Saytni ochish ↗</a><button type="button" onClick={() => void publish()} disabled={busy || !status?.configured}>{busy ? "Nashr qilinmoqda..." : "Saytga nashr qilish"}</button></div></header><section className="sa-content"><div className="sa-title"><div><p className="sa-kicker">LIVE CATALOG CMS</p><h1>Charm g‘iloflar va bloknotlar</h1><p>Save bosilganda nom, narx, rasm, rang va daftar opsiyalari public saytga chiqadi.</p></div><button type="button" onClick={() => { const product = newProduct(catalog.products.length); setCatalog((c) => ({ ...c, products: [...c.products, product] })); setExpanded(product.id); }}>+ Yangi mahsulot</button></div><div className={`sa-status ${status?.configured ? "ready" : "warn"}`}><div><strong>{status?.configured ? "Direct Save faol" : "Vercel Blob ulanishi kerak"}</strong><p>{status?.configured ? "Rasmlar va katalog doimiy saqlanadi. JSON yoki redeploy kerak emas." : "Vercel → silentscript → Storage → Create Database → Blob → Public orqali bir marta ulang."}</p></div><button type="button" onClick={() => window.location.reload()}>Holatni yangilash</button></div>{message ? <div className="sa-message">{message}</div> : null}{error ? <div className="sa-error">{error}</div> : null}<div className="sa-list">{catalog.products.map((product, index) => <article key={`${product.id}-${index}`}><button className="sa-summary" type="button" onClick={() => setExpanded(expanded === product.id ? null : product.id)}><div className="sa-thumb">{product.image ? <img src={product.image} alt=""/> : <span>Rasm yo‘q</span>}</div><div><small>{product.category.toUpperCase()} · {product.size}</small><h2>{product.name.uz}</h2><p>{formatPrice(product.basePrice, "so‘m")}{product.supportsInsert ? ` + daftar ${formatPrice(product.insertPrice ?? 0, "so‘m")}` : ""}</p></div><div><span className={product.active ? "on" : "off"}>{product.active ? "Faol" : "Yashirin"}</span><b>{expanded === product.id ? "−" : "+"}</b></div></button>{expanded === product.id ? <div className="sa-editor"><div className="sa-grid three"><label>ID<input value={product.id} onChange={(e) => patchProduct(product.id, { id: e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase() })}/></label><label>Kategoriya<select value={product.category} onChange={(e) => patchProduct(product.id, { category: e.target.value as ProductCategory })}><option value="cover">Charm g‘ilof</option><option value="notebook">Bloknot / refill</option><option value="set">To‘plam</option></select></label><label>O‘lcham<select value={product.size} onChange={(e) => patchProduct(product.id, { size: e.target.value as "A5" | "A6" })}><option>A5</option><option>A6</option></select></label></div><div className="sa-locales">{locales.map((locale) => <div key={locale}><h3>{locale.toUpperCase()}</h3><label>Nomi<input value={product.name[locale]} onChange={(e) => patchText(product.id, "name", locale, e.target.value)}/></label><label>Tavsifi<textarea value={product.description[locale]} onChange={(e) => patchText(product.id, "description", locale, e.target.value)}/></label></div>)}</div><div className="sa-grid four"><label>Asosiy narx<input type="number" value={product.basePrice} onChange={(e) => patchProduct(product.id, { basePrice: Number(e.target.value) || 0 })}/></label><label>Daftar narxi<input type="number" value={product.insertPrice ?? 0} disabled={!product.supportsInsert} onChange={(e) => patchProduct(product.id, { insertPrice: Number(e.target.value) || 0 })}/></label><label>Sovg‘a qutisi<input type="number" value={product.giftBoxPrice ?? 0} onChange={(e) => patchProduct(product.id, { giftBoxPrice: Number(e.target.value) || 0 })}/></label><label>Sahifalar<input type="number" value={product.pages ?? product.insertPages ?? 0} onChange={(e) => product.supportsInsert ? patchProduct(product.id, { insertPages: Number(e.target.value) || 0 }) : patchProduct(product.id, { pages: Number(e.target.value) || 0 })}/></label></div><div className="sa-switches"><label><input type="checkbox" checked={product.active} onChange={(e) => patchProduct(product.id, { active: e.target.checked })}/> Saytda ko‘rsatilsin</label><label><input type="checkbox" checked={Boolean(product.featured)} onChange={(e) => patchProduct(product.id, { featured: e.target.checked })}/> Featured</label><label><input type="checkbox" checked={product.supportsInsert} onChange={(e) => patchProduct(product.id, { supportsInsert: e.target.checked })}/> Ichiga daftar qo‘shish mumkin</label></div><div className="sa-image"><div>{product.image ? <img src={product.image} alt={product.name.uz}/> : <span>Rasm yo‘q</span>}</div><section><label>Rasm URL<input value={product.image} onChange={(e) => patchProduct(product.id, { image: e.target.value })}/></label><label className="sa-upload"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={!status?.configured || busy} onChange={(e) => void upload(product.id, e)}/><span>Kompyuterdan rasm yuklash</span></label><small>JPG, PNG yoki WEBP · maksimal 4 MB</small></section></div><div className="sa-colors"><header><h3>Ranglar</h3><button type="button" onClick={() => patchProduct(product.id, { colors: [...product.colors, newColor(product.colors.length)] })}>+ Rang</button></header>{product.colors.map((color, colorIndex) => <div className="sa-color" key={`${color.id}-${colorIndex}`}><input type="color" value={color.hex} onChange={(e) => patchColor(product.id, color.id, { hex: e.target.value })}/><input value={color.id} onChange={(e) => patchColor(product.id, color.id, { id: e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase() })}/>{locales.map((locale) => <input key={locale} value={color.name[locale]} onChange={(e) => patchColorName(product.id, color.id, locale, e.target.value)} placeholder={locale.toUpperCase()}/>)}<button type="button" disabled={product.colors.length <= 1} onClick={() => patchProduct(product.id, { colors: product.colors.filter((_, i) => i !== colorIndex) })}>×</button></div>)}</div><div className="sa-danger"><button type="button" onClick={() => { if (confirm("Mahsulotni o‘chirasizmi?")) setCatalog((c) => ({ ...c, products: c.products.filter((_, i) => i !== index) })); }}>Mahsulotni o‘chirish</button></div></div> : null}</article>)}</div><div className="sa-sticky"><span>{catalog.products.length} ta mahsulot · v{catalog.version}</span><button type="button" onClick={() => void publish()} disabled={busy || !status?.configured}>{busy ? "Nashr qilinmoqda..." : "Saytga nashr qilish"}</button></div></section><AdminStyles/></main>;
}

function AdminStyles() {
  return <style jsx global>{`
    :root{--a-bg:#f5f1e9;--a-paper:#fffdf8;--a-ink:#2d251f;--a-muted:#716a63;--a-green:#626b49;--a-line:rgba(54,43,35,.16)}*{box-sizing:border-box}body{margin:0;background:var(--a-bg);color:var(--a-ink);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}.sa-login{min-height:100vh;display:grid;place-items:center;padding:20px}.sa-login>section{width:min(460px,100%);background:var(--a-paper);padding:46px;border:1px solid var(--a-line);box-shadow:0 30px 80px rgba(50,38,29,.12)}.sa-brand{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none;font:600 27px Georgia,serif}.sa-brand img{width:46px;height:46px;object-fit:cover;border-radius:7px}.sa-kicker{font-size:10px;font-weight:800;letter-spacing:.15em;color:var(--a-green);margin:28px 0 12px}.sa-login h1,.sa-title h1{font:400 46px/1 Georgia,serif;letter-spacing:-.04em;margin:0 0 16px}.sa-login p,.sa-title p{color:var(--a-muted);line-height:1.65}.sa-login label,.sa-editor label{display:grid;gap:7px;font-size:11px;font-weight:700}.sa-login input,.sa-editor input,.sa-editor select,.sa-editor textarea{width:100%;padding:11px;border:1px solid var(--a-line);background:white}.sa-login>section>button,.sa-header-actions button,.sa-title>button,.sa-sticky button,.sa-dashboard>header button{width:100%;min-height:46px;border:0;background:var(--a-green);color:white;font-weight:800;cursor:pointer}.sa-warning,.sa-error,.sa-message{padding:12px;margin:14px 0;font-size:12px;line-height:1.55}.sa-warning{background:#fff4d4;color:#72551b}.sa-error{background:#fde4df;color:#8d2d24}.sa-message{background:#e5efdf;color:#31552d}.sa-dashboard>header{height:72px;position:sticky;top:0;z-index:20;display:flex;justify-content:space-between;align-items:center;padding:0 max(22px,calc((100vw - 1220px)/2));background:rgba(255,253,248,.94);border-bottom:1px solid var(--a-line);backdrop-filter:blur(15px)}.sa-dashboard>header>div{display:flex;align-items:center;gap:18px;font-size:12px}.sa-dashboard>header a{color:inherit}.sa-dashboard>header button{width:auto;padding:0 17px}.sa-content{width:min(1220px,calc(100% - 42px));margin:auto;padding:58px 0 100px}.sa-title{display:flex;justify-content:space-between;gap:40px;align-items:end}.sa-title>div{max-width:760px}.sa-title>button{border:1px solid var(--a-green);background:transparent;color:var(--a-green);padding:13px 17px;font-weight:800;cursor:pointer}.sa-status{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px;margin:30px 0;border:1px solid}.sa-status.ready{background:#e8f0e2;border-color:#a8b99b}.sa-status.warn{background:#fff3d2;border-color:#dec47b}.sa-status p{margin:5px 0 0;color:var(--a-muted);font-size:13px}.sa-status button{border:1px solid var(--a-line);background:transparent;padding:9px 12px}.sa-list{display:grid;gap:13px}.sa-list>article{background:var(--a-paper);border:1px solid var(--a-line)}.sa-summary{width:100%;display:grid;grid-template-columns:88px 1fr auto;gap:17px;align-items:center;padding:12px;border:0;background:transparent;text-align:left;cursor:pointer}.sa-thumb{height:78px;background:#ded3c4;display:grid;place-items:center;font-size:10px;color:var(--a-muted)}.sa-thumb img,.sa-image img{width:100%;height:100%;object-fit:cover}.sa-summary small{font-size:9px;letter-spacing:.1em;color:var(--a-green)}.sa-summary h2{font:400 23px Georgia,serif;margin:5px 0}.sa-summary p{margin:0;color:var(--a-muted);font-size:12px}.sa-summary>div:last-child{display:flex;align-items:center;gap:17px}.sa-summary .on,.sa-summary .off{padding:6px 8px;font-size:9px;font-weight:800}.sa-summary .on{background:#e5efdf;color:#31552d}.sa-summary .off{background:#eee9e3;color:#756b63}.sa-summary b{font-size:25px}.sa-editor{padding:25px;border-top:1px solid var(--a-line)}.sa-grid{display:grid;gap:13px}.sa-grid.three{grid-template-columns:2fr 1fr 1fr}.sa-grid.four{grid-template-columns:repeat(4,1fr);margin:22px 0}.sa-locales{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}.sa-locales>div{padding:15px;background:#f7f3ec}.sa-locales h3{font-size:11px;letter-spacing:.1em}.sa-locales label+label{margin-top:11px}.sa-editor textarea{min-height:95px;resize:vertical}.sa-switches{display:flex;gap:22px;flex-wrap:wrap;padding:17px 0;border-block:1px solid var(--a-line)}.sa-switches label{display:flex;align-items:center;gap:7px}.sa-switches input{width:auto}.sa-image{display:grid;grid-template-columns:210px 1fr;gap:20px;margin:22px 0}.sa-image>div{height:190px;background:#ded3c4;display:grid;place-items:center;color:var(--a-muted)}.sa-upload{margin-top:12px;display:block!important}.sa-upload input{display:none}.sa-upload span{display:inline-block;padding:11px 14px;border:1px solid var(--a-green);color:var(--a-green);cursor:pointer}.sa-image small{display:block;margin-top:9px;color:var(--a-muted)}.sa-colors{border-top:1px solid var(--a-line);padding-top:18px}.sa-colors>header{display:flex;justify-content:space-between}.sa-colors>header button{border:1px solid var(--a-line);background:transparent}.sa-color{display:grid;grid-template-columns:48px 1fr repeat(3,1fr) 38px;gap:8px;margin-top:8px}.sa-color input{min-width:0}.sa-color input[type=color]{padding:2px}.sa-color button{border:1px solid var(--a-line);background:transparent}.sa-danger{margin-top:24px;text-align:right}.sa-danger button{border:0;background:transparent;color:#9d3328;text-decoration:underline}.sa-sticky{position:sticky;bottom:12px;margin-top:25px;padding:13px 16px;background:#2f2925;color:white;display:flex;justify-content:space-between;align-items:center;box-shadow:0 15px 45px rgba(30,24,20,.25)}.sa-sticky button{width:auto;padding:0 20px}.sa-dashboard button:disabled,.sa-login button:disabled{opacity:.45;cursor:not-allowed}
    @media(max-width:850px){.sa-dashboard>header>div>span{display:none}.sa-content{width:calc(100% - 24px)}.sa-title{align-items:start;flex-direction:column}.sa-grid.three,.sa-grid.four,.sa-locales{grid-template-columns:1fr}.sa-image{grid-template-columns:1fr}.sa-color{grid-template-columns:42px 1fr}.sa-color input:nth-of-type(n+3){grid-column:span 1}.sa-summary{grid-template-columns:70px 1fr}.sa-summary>div:last-child{grid-column:2}.sa-dashboard>header .sa-brand span{display:none}}
  `}</style>;
}
