"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import defaultCatalog from "@/data/catalog.json";
import {
  formatPrice,
  isCatalog,
  type Catalog,
  type CatalogProduct,
} from "@/lib/catalog";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1800&q=90";
const CART_KEY = "silent-script-exact-cart-v1";
const LOCALE_KEY = "silent-script-exact-locale";
const TELEGRAM_ORDER = "thatswriter";

type SiteLocale = "uz" | "ru";
type CartLine = {
  key: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  leatherColorId: string;
  threadColor: string;
  paperColor: string;
};

type Customer = {
  name: string;
  phone: string;
  city: string;
  address: string;
  comment: string;
};

const copy = {
  uz: {
    delivery: "Yetkazib berish xaridor tomonidan to‘lanadi",
    home: "Bosh sahifa",
    products: "Mahsulotlar",
    builder: "O‘z dizayningizni yarating",
    about: "Biz haqimizda",
    contact: "Aloqa",
    order: "Buyurtma berish",
    calm: "Sokin fikrlar uchun",
    title: "Qo‘lda yaratilgan kundaliklar.",
    intro:
      "Har bir jurnal 100% qo‘l mehnati va barchasini ehtiyotkorlik bilan siz uchun tayyorlanadi.",
    limited: "Har bir kundalik cheklangan nusxada chiqariladi",
    seeProducts: "Mahsulotlarni ko‘rish",
    journals: "KUNDALIKLAR",
    choose: "Tanlash",
    from: "dan",
    create: "O‘Z DIZAYNINGIZNI YARATING",
    size: "1. O‘lcham",
    leather: "2. Charm rangi",
    thread: "3. Ip rangi",
    paper: "4. Qog‘oz rangi",
    selected: "Tanlangan konfiguratsiya",
    model: "O‘lcham",
    leatherShort: "Charm rangi",
    threadShort: "Ip rangi",
    paperShort: "Qog‘oz rangi",
    price: "Narx",
    add: "Savatchaga qo‘shish",
    cart: "Savatcha",
    empty: "Savatcha hozircha bo‘sh",
    remove: "Olib tashlash",
    total: "Jami",
    checkout: "Buyurtmani rasmiylashtirish",
    customerTitle: "Buyurtma ma’lumotlari",
    customerText:
      "Ma’lumotlarni kiriting. Tayyor buyurtma @thatswriter chatida ochiladi.",
    name: "Ism",
    phone: "Telefon raqami",
    city: "Shahar / tuman",
    address: "Aniq manzil",
    comment: "Qo‘shimcha izoh",
    send: "Telegram orqali yuborish",
    required: "Ism, telefon raqami va shaharni kiriting.",
    telegramIntro: "Assalomu alaykum! Silent Script’dan buyurtma bermoqchiman:",
    craftsmanship: "Qo‘l mehnati",
    craftsmanshipText:
      "Har bir detal shoshilmasdan, buyurtma asosida ehtiyotkorlik bilan tayyorlanadi.",
    material: "Sifatli charm",
    materialText:
      "Uzoq xizmat qiladigan, vaqt o‘tishi bilan yanada chiroyli tus oladigan material.",
    personal: "Siz uchun moslashtiriladi",
    personalText:
      "Model, charm, ip va qog‘oz rangini o‘zingiz tanlaysiz.",
    reviews: "MIJOZLAR FIKRI",
    reviewsTitle: "Yozilgan har bir sahifada o‘ziga xos hikoya.",
    footer: "Sokin fikrlar uchun qo‘lda tayyorlangan kundaliklar.",
  },
  ru: {
    delivery: "Доставку оплачивает покупатель",
    home: "Главная",
    products: "Товары",
    builder: "Создать свой дизайн",
    about: "О нас",
    contact: "Контакты",
    order: "Оформить заказ",
    calm: "Для спокойных мыслей",
    title: "Ежедневники ручной работы.",
    intro:
      "Каждый ежедневник полностью изготавливается вручную и бережно создаётся специально для вас.",
    limited: "Каждый ежедневник выпускается ограниченным тиражом",
    seeProducts: "Смотреть товары",
    journals: "ЕЖЕДНЕВНИКИ",
    choose: "Выбрать",
    from: "от",
    create: "СОЗДАЙТЕ СВОЙ ДИЗАЙН",
    size: "1. Размер",
    leather: "2. Цвет кожи",
    thread: "3. Цвет нити",
    paper: "4. Цвет бумаги",
    selected: "Выбранная конфигурация",
    model: "Размер",
    leatherShort: "Цвет кожи",
    threadShort: "Цвет нити",
    paperShort: "Цвет бумаги",
    price: "Цена",
    add: "Добавить в корзину",
    cart: "Корзина",
    empty: "Корзина пока пуста",
    remove: "Удалить",
    total: "Итого",
    checkout: "Оформить заказ",
    customerTitle: "Данные заказа",
    customerText:
      "Введите данные. Готовый заказ откроется в чате @thatswriter.",
    name: "Имя",
    phone: "Номер телефона",
    city: "Город / район",
    address: "Точный адрес",
    comment: "Комментарий",
    send: "Отправить через Telegram",
    required: "Введите имя, номер телефона и город.",
    telegramIntro: "Здравствуйте! Хочу оформить заказ в Silent Script:",
    craftsmanship: "Ручная работа",
    craftsmanshipText:
      "Каждая деталь бережно изготавливается вручную под заказ.",
    material: "Качественная кожа",
    materialText:
      "Прочный материал, который со временем становится ещё красивее.",
    personal: "Создано для вас",
    personalText:
      "Вы самостоятельно выбираете модель, цвет кожи, нити и бумаги.",
    reviews: "ОТЗЫВЫ КЛИЕНТОВ",
    reviewsTitle: "У каждой заполненной страницы своя история.",
    footer: "Ежедневники ручной работы для спокойных мыслей.",
  },
} as const;

const threadColors = [
  { id: "cream", uz: "Krem", ru: "Кремовый", hex: "#eee3d0" },
  { id: "sky", uz: "Havorang", ru: "Голубой", hex: "#9bc5d1" },
  { id: "sand", uz: "Qumrang", ru: "Песочный", hex: "#d8bd8b" },
  { id: "black", uz: "Qora", ru: "Чёрный", hex: "#242424" },
  { id: "brown", uz: "Jigarrang", ru: "Коричневый", hex: "#6a4637" },
  { id: "olive", uz: "Zaytun", ru: "Оливковый", hex: "#66704a" },
  { id: "wine", uz: "Bordo", ru: "Бордовый", hex: "#7a2636" },
  { id: "red", uz: "Qizil", ru: "Красный", hex: "#b23b35" },
];

const paperColors = [
  { id: "cream", uz: "Krem", ru: "Кремовая", hex: "#eee4cf" },
  { id: "white", uz: "Oq", ru: "Белая", hex: "#fffdf7" },
];

function localized(product: CatalogProduct, locale: SiteLocale) {
  return product.name[locale];
}

function isCustom(product: CatalogProduct) {
  return /custom/i.test(product.id) || /custom/i.test(product.name.en ?? "");
}

function ProductMockup({
  product,
  large = false,
}: {
  product: CatalogProduct;
  large?: boolean;
}) {
  const color = product.colors[0]?.hex ?? "#6f503d";
  return (
    <div
      className={`exact-book ${large ? "exact-book--large" : ""}`}
      style={{ "--book-color": color } as CSSProperties}
      aria-hidden="true"
    >
      <span className="exact-book__spine" />
      <span className="exact-book__band" />
      <span className="exact-book__shadow" />
    </div>
  );
}

export default function ExactStorefront() {
  const [locale, setLocale] = useState<SiteLocale>("uz");
  const [catalog, setCatalog] = useState<Catalog>(defaultCatalog as Catalog);
  const [modelId, setModelId] = useState("");
  const [leatherColorId, setLeatherColorId] = useState("");
  const [threadColor, setThreadColor] = useState(threadColors[4].id);
  const [paperColor, setPaperColor] = useState(paperColors[0].id);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    city: "",
    address: "",
    comment: "",
  });
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const t = copy[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    if (storedLocale === "uz" || storedLocale === "ru") setLocale(storedLocale);
    try {
      const storedCart = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
      if (Array.isArray(storedCart)) setCart(storedCart as CartLine[]);
    } catch {
      localStorage.removeItem(CART_KEY);
    }
    fetch("/api/catalog", { cache: "no-store" })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("catalog")),
      )
      .then((value: unknown) => {
        if (isCatalog(value)) setCatalog(value);
      })
      .catch(() => undefined)
      .finally(() => setMounted(true));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (mounted) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, mounted]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, checkoutOpen]);

  const products = useMemo(
    () => catalog.products.filter((product) => product.active).slice(0, 6),
    [catalog],
  );

  const modelProducts = useMemo(
    () =>
      catalog.products
        .filter((product) => product.active && product.category === "cover")
        .slice(0, 6),
    [catalog],
  );

  const selectedProduct =
    modelProducts.find((product) => product.id === modelId) ??
    modelProducts.find((product) => isCustom(product)) ??
    modelProducts[0] ??
    products[0];

  useEffect(() => {
    if (!selectedProduct) return;
    setModelId((current) => current || selectedProduct.id);
    setLeatherColorId((current) =>
      selectedProduct.colors.some((color) => color.id === current)
        ? current
        : selectedProduct.colors[0]?.id ?? "",
    );
  }, [selectedProduct]);

  const selectedLeather = selectedProduct?.colors.find(
    (color) => color.id === leatherColorId,
  );
  const selectedThread = threadColors.find((color) => color.id === threadColor)!;
  const selectedPaper = paperColors.find((color) => color.id === paperColor)!;
  const price = selectedProduct?.basePrice ?? 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  function chooseProduct(product: CatalogProduct) {
    setModelId(product.id);
    setLeatherColorId(product.colors[0]?.id ?? "");
    document.getElementById("builder")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function addToCart() {
    if (!selectedProduct) return;
    const key = [
      selectedProduct.id,
      leatherColorId,
      threadColor,
      paperColor,
    ].join("-");
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...current,
        {
          key,
          productId: selectedProduct.id,
          quantity: 1,
          unitPrice: price,
          leatherColorId,
          threadColor,
          paperColor,
        },
      ];
    });
    setCartOpen(true);
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.key !== key) return [item];
        const quantity = item.quantity + delta;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      }),
    );
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.city.trim()) {
      setError(t.required);
      return;
    }
    if (!cart.length) return;

    const itemLines = cart
      .map((item, index) => {
        const product = catalog.products.find(
          (candidate) => candidate.id === item.productId,
        );
        if (!product) return "";
        const leather = product.colors.find(
          (color) => color.id === item.leatherColorId,
        );
        const thread = threadColors.find((color) => color.id === item.threadColor);
        const paper = paperColors.find((color) => color.id === item.paperColor);
        return [
          `${index + 1}. ${localized(product, locale)}`,
          `${t.leatherShort}: ${leather?.name[locale] ?? "—"}`,
          `${t.threadShort}: ${locale === "uz" ? thread?.uz : thread?.ru}`,
          `${t.paperShort}: ${locale === "uz" ? paper?.uz : paper?.ru}`,
          `${item.quantity} × ${formatPrice(item.unitPrice, "so‘m")}`,
        ].join("\n");
      })
      .filter(Boolean)
      .join("\n\n");

    const message = [
      t.telegramIntro,
      "",
      itemLines,
      "",
      `${t.total}: ${formatPrice(cartTotal, "so‘m")}`,
      "",
      `${t.name}: ${customer.name}`,
      `${t.phone}: ${customer.phone}`,
      `${t.city}: ${customer.city}`,
      `${t.address}: ${customer.address || "—"}`,
      `${t.comment}: ${customer.comment || "—"}`,
      "",
      t.delivery,
    ].join("\n");

    void navigator.clipboard?.writeText(message).catch(() => undefined);
    window.open(
      `https://t.me/${TELEGRAM_ORDER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setError("");
  }

  return (
    <main className="exact-site">
      <div className="exact-topbar">
        <div className="exact-shell exact-topbar__inner">
          <span>▱&nbsp; {t.delivery}</span>
          <div>
            <a href="https://t.me/thatswriter" target="_blank" rel="noreferrer">
              Telegram: @thatswriter
            </a>
            <a
              href="https://instagram.com/silentscriptuz"
              target="_blank"
              rel="noreferrer"
            >
              Instagram: @silentscriptuz
            </a>
          </div>
        </div>
      </div>

      <header className="exact-header">
        <div className="exact-shell exact-header__inner">
          <a className="exact-brand" href="#home">
            silent script.
          </a>
          <nav>
            <a href="#home">{t.home}</a>
            <a href="#products">{t.products}</a>
            <a href="#builder">{t.builder}</a>
            <a href="#about">{t.about}</a>
            <a href="#contact">{t.contact}</a>
          </nav>
          <div className="exact-actions">
            <div className="exact-locale">
              {(["uz", "ru"] as SiteLocale[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={locale === item ? "is-active" : ""}
                  onClick={() => setLocale(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="exact-cart-button"
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={t.cart}
            >
              ♡<span>{cartCount}</span>
            </button>
            <button
              className="exact-order-button"
              type="button"
              onClick={() => {
                if (cart.length) setCartOpen(true);
                else
                  document.getElementById("builder")?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              {t.order}
            </button>
          </div>
        </div>
      </header>

      <section className="exact-hero" id="home">
        <div className="exact-hero__copy">
          <div className="exact-hero__copy-inner">
            <p className="exact-kicker">◉&nbsp; {t.calm}</p>
            <h1>{t.title}</h1>
            <p className="exact-intro">{t.intro}</p>
            <p className="exact-limited">◉&nbsp; {t.limited}</p>
            <a className="exact-primary" href="#products">
              {t.seeProducts} <span>→</span>
            </a>
          </div>
        </div>
        <div className="exact-hero__media">
          <img src={HERO_IMAGE} alt="Silent Script charm kundaligi" />
        </div>
      </section>

      <section className="exact-products" id="products">
        <div className="exact-shell">
          <div className="exact-section-title">
            <span />
            <h2>{t.journals}</h2>
            <span />
          </div>
          <div className="exact-product-grid">
            {products.map((product, index) => (
              <article className="exact-product-card" key={product.id}>
                {index === 0 ? (
                  <span className="exact-popular">
                    {locale === "uz" ? "Eng mashhur" : "Популярный"}
                  </span>
                ) : null}
                <div className="exact-product-visual">
                  <ProductMockup product={product} />
                  {isCustom(product) ? (
                    <span className="exact-plus">+</span>
                  ) : null}
                </div>
                <h3>{localized(product, locale)}</h3>
                <p>
                  {formatPrice(product.basePrice, "so‘m")} {t.from}
                </p>
                <button type="button" onClick={() => chooseProduct(product)}>
                  {t.choose}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedProduct ? (
        <section className="exact-builder-wrap" id="builder">
          <div className="exact-shell exact-builder">
            <div className="exact-builder-title">
              <span />
              <h2>{t.create}</h2>
              <span />
            </div>

            <div className="exact-builder-grid">
              <div className="exact-controls">
                <div className="exact-control-group">
                  <h3>{t.size}</h3>
                  <div className="exact-models">
                    {modelProducts.slice(0, 3).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className={selectedProduct.id === product.id ? "is-active" : ""}
                        onClick={() => chooseProduct(product)}
                      >
                        {product.size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="exact-control-group">
                  <h3>{t.leather}</h3>
                  <div className="exact-swatches">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        aria-label={color.name[locale]}
                        title={color.name[locale]}
                        className={leatherColorId === color.id ? "is-active" : ""}
                        onClick={() => setLeatherColorId(color.id)}
                      >
                        <i style={{ background: color.hex }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="exact-control-group">
                  <h3>{t.thread}</h3>
                  <div className="exact-swatches">
                    {threadColors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        aria-label={locale === "uz" ? color.uz : color.ru}
                        title={locale === "uz" ? color.uz : color.ru}
                        className={threadColor === color.id ? "is-active" : ""}
                        onClick={() => setThreadColor(color.id)}
                      >
                        <i style={{ background: color.hex }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="exact-control-group">
                  <h3>{t.paper}</h3>
                  <div className="exact-swatches">
                    {paperColors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        aria-label={locale === "uz" ? color.uz : color.ru}
                        title={locale === "uz" ? color.uz : color.ru}
                        className={paperColor === color.id ? "is-active" : ""}
                        onClick={() => setPaperColor(color.id)}
                      >
                        <i style={{ background: color.hex }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="exact-preview">
                <ProductMockup product={selectedProduct} large />
                <div
                  className="exact-spine-preview"
                  style={{
                    "--book-color": selectedLeather?.hex ?? "#6f503d",
                    "--thread-color": selectedThread.hex,
                  } as CSSProperties}
                >
                  <i />
                  <i />
                  <i />
                  <span />
                </div>
              </div>

              <aside className="exact-summary">
                <h3>{t.selected}</h3>
                <dl>
                  <div>
                    <dt>{t.model}:</dt>
                    <dd>{selectedProduct.size}</dd>
                  </div>
                  <div>
                    <dt>{t.leatherShort}:</dt>
                    <dd>{selectedLeather?.name[locale] ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>{t.threadShort}:</dt>
                    <dd>{locale === "uz" ? selectedThread.uz : selectedThread.ru}</dd>
                  </div>
                  <div>
                    <dt>{t.paperShort}:</dt>
                    <dd>{locale === "uz" ? selectedPaper.uz : selectedPaper.ru}</dd>
                  </div>
                </dl>
                <p className="exact-summary__price">
                  {t.price}: <strong>{formatPrice(price, "so‘m")}</strong> {t.from}
                </p>
                <button type="button" onClick={addToCart}>
                  <span>♡</span> {t.add}
                </button>
              </aside>
            </div>
          </div>
        </section>
      ) : null}

      <section className="exact-values" id="about">
        <div className="exact-shell exact-values__grid">
          <article>
            <span>01</span>
            <h3>{t.craftsmanship}</h3>
            <p>{t.craftsmanshipText}</p>
          </article>
          <article>
            <span>02</span>
            <h3>{t.material}</h3>
            <p>{t.materialText}</p>
          </article>
          <article>
            <span>03</span>
            <h3>{t.personal}</h3>
            <p>{t.personalText}</p>
          </article>
        </div>
      </section>

      <section className="exact-reviews">
        <div className="exact-shell">
          <p className="exact-kicker">{t.reviews}</p>
          <h2>{t.reviewsTitle}</h2>
          <div className="exact-review-grid">
            {[0, 1, 2].map((item) => (
              <article key={item}>
                <div>★★★★★</div>
                <p>
                  {locale === "uz"
                    ? "Kundalik juda nafis va sifatli tayyorlangan. Qo‘lda ushlaganda materialning farqi darhol seziladi."
                    : "Ежедневник выполнен очень аккуратно. Качество материала чувствуется сразу, как только берёшь его в руки."}
                </p>
                <strong>{["Madina", "Aziza", "Dilnoza"][item]}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="exact-footer" id="contact">
        <div className="exact-shell exact-footer__inner">
          <div>
            <a className="exact-brand exact-brand--light" href="#home">
              silent script.
            </a>
            <p>{t.footer}</p>
          </div>
          <div>
            <a href="https://t.me/thatswriter" target="_blank" rel="noreferrer">
              Telegram — @thatswriter
            </a>
            <a
              href="https://instagram.com/silentscriptuz"
              target="_blank"
              rel="noreferrer"
            >
              Instagram — @silentscriptuz
            </a>
          </div>
        </div>
      </footer>

      {cartOpen ? (
        <div className="exact-overlay" onMouseDown={() => setCartOpen(false)}>
          <aside
            className="exact-cart"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>{t.cart}</small>
                <h2>{cartCount}</h2>
              </div>
              <button type="button" onClick={() => setCartOpen(false)}>
                ×
              </button>
            </header>
            <div className="exact-cart__list">
              {!cart.length ? <p className="exact-empty">{t.empty}</p> : null}
              {cart.map((item) => {
                const product = catalog.products.find(
                  (candidate) => candidate.id === item.productId,
                );
                if (!product) return null;
                return (
                  <article key={item.key}>
                    <div className="exact-cart__thumb">
                      <ProductMockup product={product} />
                    </div>
                    <div>
                      <h3>{localized(product, locale)}</h3>
                      <p>{formatPrice(item.unitPrice, "so‘m")}</p>
                      <div className="exact-quantity">
                        <button type="button" onClick={() => changeQuantity(item.key, -1)}>
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => changeQuantity(item.key, 1)}>
                          +
                        </button>
                      </div>
                      <button
                        className="exact-remove"
                        type="button"
                        onClick={() =>
                          setCart((current) =>
                            current.filter((line) => line.key !== item.key),
                          )
                        }
                      >
                        {t.remove}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            {cart.length ? (
              <footer>
                <div>
                  <span>{t.total}</span>
                  <strong>{formatPrice(cartTotal, "so‘m")}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  {t.checkout}
                </button>
              </footer>
            ) : null}
          </aside>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="exact-overlay" onMouseDown={() => setCheckoutOpen(false)}>
          <section
            className="exact-checkout"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="exact-checkout__close"
              type="button"
              onClick={() => setCheckoutOpen(false)}
            >
              ×
            </button>
            <p className="exact-kicker">TELEGRAM</p>
            <h2>{t.customerTitle}</h2>
            <p>{t.customerText}</p>
            <form onSubmit={submitOrder}>
              <label>
                {t.name} *
                <input
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label>
                {t.phone} *
                <input
                  value={customer.phone}
                  inputMode="tel"
                  placeholder="+998"
                  onChange={(event) =>
                    setCustomer((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </label>
              <label>
                {t.city} *
                <input
                  value={customer.city}
                  onChange={(event) =>
                    setCustomer((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </label>
              <label>
                {t.address}
                <input
                  value={customer.address}
                  onChange={(event) =>
                    setCustomer((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </label>
              <label className="exact-checkout__wide">
                {t.comment}
                <textarea
                  rows={3}
                  value={customer.comment}
                  onChange={(event) =>
                    setCustomer((current) => ({ ...current, comment: event.target.value }))
                  }
                />
              </label>
              {error ? <p className="exact-error">{error}</p> : null}
              <div className="exact-checkout__total">
                <span>{t.total}</span>
                <strong>{formatPrice(cartTotal, "so‘m")}</strong>
              </div>
              <button className="exact-checkout__send" type="submit">
                {t.send}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
