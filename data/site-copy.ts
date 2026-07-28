export type Locale = "uz" | "en" | "ru";
export type PageStyle = "lined" | "grid" | "dotted" | "blank";


export type TextPair = readonly [string, string];

export type SiteCopy = {
  meta: { title: string; description: string };
  common: {
    currency: string;
    yes: string;
    no: string;
    pagesUnit: string;
    close: string;
    remove: string;
    search: string;
    menu: string;
    bag: string;
    total: string;
    quantity: string;
    openTelegram: string;
    backToShop: string;
  };
  announcement: string;
  nav: { home: string; shop: string; customize: string; about: string; journal: string; faq: string };
  hero: { eyebrow: string; title: string; description: string; create: string; channel: string; proof: string[] };
  products: { eyebrow: string; title: string; all: string; quickView: string; add: string; added: string };
  benefits: TextPair[];
  custom: {
    eyebrow: string;
    title: string;
    description: string;
    note: string;
    size: string;
    coverColor: string;
    pageType: string;
    coverText: string;
    placeholder: string;
    characters: string;
    giftBox: string;
    summary: string;
    color: string;
    pages: string;
    personalization: string;
    customName: string;
    defaultPersonalization: string;
    pageTypes: Record<PageStyle, string>;
  };
  story: { eyebrow: string; title: string; description: string; link: string; quote: string };
  journal: { eyebrow: string; title: string; link: string; items: TextPair[] };
  faq: { eyebrow: string; title: string; description: string; items: TextPair[] };
  newsletter: { eyebrow: string; title: string; button: string };
  footer: {
    description: string;
    shop: string;
    allProducts: string;
    customize: string;
    giftSets: string;
    help: string;
    delivery: string;
    orderStatus: string;
    brand: string;
    about: string;
    contact: string;
    connect: string;
    rights: string;
  };
  search: { placeholder: string; empty: string };
  cart: {
    eyebrow: string;
    title: string;
    emptyTitle: string;
    emptyDescription: string;
    deliveryNote: string;
    checkout: string;
    giftBox: string;
  };
  productModal: { collection: string; paper: string; format: string; size: string };
  order: {
    eyebrow: string;
    title: string;
    description: string;
    name: string;
    namePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    comment: string;
    commentPlaceholder: string;
    preview: string;
    copy: string;
    copied: string;
    send: string;
    required: string;
    directContact: string;
    greeting: string;
    emptyGreeting: string;
    customer: string;
    phoneLabel: string;
    addressLabel: string;
    commentLabel: string;
  };
};

export const localeOptions: Array<{ code: Locale; short: string; label: string }> = [
  { code: "uz", short: "UZ", label: "O‘zbekcha" },
  { code: "en", short: "EN", label: "English" },
  { code: "ru", short: "RU", label: "Русский" },
];

export const translations: Record<Locale, SiteCopy> = {
  uz: {
    meta: {
      title: "silent script. — Xotirjam fikrlar uchun bloknotlar",
      description: "Premium bloknotlar, plannerlar va shaxsiylashtirilgan sovg‘a to‘plamlari.",
    },
    common: {
      currency: "so‘m",
      yes: "Ha",
      no: "Yo‘q",
      pagesUnit: "sahifa",
      close: "Yopish",
      remove: "Olib tashlash",
      search: "Qidirish",
      menu: "Menyu",
      bag: "Savat",
      total: "Jami",
      quantity: "Miqdor",
      openTelegram: "Telegramda ochish",
      backToShop: "Mahsulotlarni ko‘rish",
    },
    announcement: "Shaxsiy muqova · Premium qadoq · O‘zbekiston bo‘ylab yetkazib berish",
    nav: {
      home: "Bosh sahifa",
      shop: "Do‘kon",
      customize: "Moslashtirish",
      about: "Biz haqimizda",
      journal: "Journal",
      faq: "FAQ",
    },
    hero: {
      eyebrow: "WRITE SOFTLY. THINK DEEPLY.",
      title: "Xotirjam fikrlar uchun bloknotlar.",
      description: "Yozish, rejalash va o‘zingizni tinglash uchun puxta yaratilgan premium bloknotlar.",
      create: "Bloknot yaratish",
      channel: "Telegram kanal",
      proof: ["Shaxsiy yozuv", "Premium qadoq", "O‘zbekiston bo‘ylab"],
    },
    products: {
      eyebrow: "TANLANGAN TO‘PLAM",
      title: "Eng sevimli bloknotlar",
      all: "Barchasini ko‘rish",
      quickView: "Tezkor ko‘rish",
      add: "Savatga qo‘shish",
      added: "Savatga qo‘shildi",
    },
    benefits: [
      ["Premium material", "Uzoq xizmat qiladigan sinchkov tanlangan materiallar."],
      ["Puxta dizayn", "Yozishga xalal bermaydigan minimal va qulay tuzilma."],
      ["Siz uchun", "Rang, sahifa va shaxsiy yozuvni o‘zingiz tanlaysiz."],
      ["Sovg‘a uchun", "Chiroyli qadoqlangan va berishga tayyor to‘plam."],
      ["Sokin estetika", "Fikrni jamlashga yordam beradigan tabiiy ranglar."],
    ],
    custom: {
      eyebrow: "O‘ZINGIZNIKINI YARATING",
      title: "Sizga mos bloknot.",
      description: "Har bir detalni ehtiyojingiz va uslubingizga moslang. Tanlovingiz darhol preview va narxda aks etadi.",
      note: "Muqovaga faqat bitta bosh harf yoziladi.",
      size: "O‘lcham",
      coverColor: "Muqova rangi",
      pageType: "Sahifa turi",
      coverText: "Muqovadagi bosh harf",
      placeholder: "G",
      characters: "harf",
      giftBox: "Sovg‘a qutisi",
      summary: "Sizning bloknotingiz",
      color: "Rang",
      pages: "Sahifalar",
      personalization: "Yozuv",
      customName: "Shaxsiy Silent Notebook",
      defaultPersonalization: "S",
      pageTypes: {
        lined: "Chiziqli",
        grid: "Katakli",
        dotted: "Nuqtali",
        blank: "Oq",
      } satisfies Record<PageStyle, string>,
    },
    story: {
      eyebrow: "SILENT PHILOSOPHY",
      title: "Shovqindan uzoqda yozilgan fikrlar.",
      description: "silent script. — tezkor dunyoda sekinlashish uchun yaratilgan bloknotlar brendi. Har bir sahifa fikrni tartibga solish, muhim narsalarni eslab qolish va o‘zingiz bilan sokin suhbat qurish uchun.",
      link: "Bizning hikoya",
      quote: "“Qog‘ozga tushgan fikr, ichingizdagi shovqinni sekinlashtiradi.”",
    },
    journal: {
      eyebrow: "JOURNAL",
      title: "Yaxshi yashash uchun ilhom",
      link: "Telegramda o‘qish",
      items: [
        ["Journaling kuchi", "Har kuni 10 daqiqalik yozuv fikrlarga qanday aniqlik beradi."],
        ["Yoqtirgan hayotingizni rejalash", "Katta maqsadlarni sokin va real qadamlarga aylantirish."],
        ["Nega sifat muhim", "Ko‘p ishlatiladigan buyumlarda material va detalning farqi."],
        ["Izchil bo‘lishning 10 yo‘li", "Motivatsiyani kutmasdan, kichik odatlarni saqlab qolish."],
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Ko‘p so‘raladigan savollar",
      description: "Buyurtma jarayoni haqida eng muhim javoblar.",
      items: [
        ["Yetkazib berish qancha vaqt oladi?", "Namangan ichida odatda 1–2 kun, boshqa hududlarga 2–5 ish kuni. Aniq muddat buyurtma tasdiqlanganda aytiladi."],
        ["Muqovaga qanday yozuv tushirish mumkin?", "Muqovaga faqat bitta bosh harf tushiriladi. Yakuniy ko‘rinish buyurtmadan oldin tasdiqlanadi."],
        ["Oldindan to‘lov kerakmi?", "Shaxsiylashtirilgan buyurtmalar uchun qisman oldindan to‘lov talab qilinishi mumkin. Tayyor mahsulotlarda shartlar Telegramda kelishiladi."],
        ["Sovg‘a qutisiga nima kiradi?", "Premium quti, himoya qog‘ozi, brend kartasi va tanlangan modelga qarab ruchka yoki kichik aksessuar."],
      ],
    },
    newsletter: {
      eyebrow: "SILENT LETTERS",
      title: "Yangi kolleksiyalarni birinchi bo‘lib biling.",
      button: "Kanalga qo‘shilish",
    },
    footer: {
      description: "Xotirjam fikrlar uchun bloknotlar. Yozing, rejalang va aniqlik bilan mulohaza qiling.",
      shop: "Do‘kon",
      allProducts: "Barcha mahsulotlar",
      customize: "Moslashtirish",
      giftSets: "Sovg‘a to‘plamlari",
      help: "Yordam",
      delivery: "Yetkazib berish",
      orderStatus: "Buyurtma holati",
      brand: "Brend",
      about: "Biz haqimizda",
      contact: "Aloqa",
      connect: "Bog‘lanish",
      rights: "Barcha huquqlar himoyalangan.",
    },
    search: {
      placeholder: "Bloknot, planner yoki sahifa turini qidiring...",
      empty: "Hech narsa topilmadi.",
    },
    cart: {
      eyebrow: "SAVAT",
      title: "Sizning tanlovingiz",
      emptyTitle: "Savatingiz hozircha bo‘sh",
      emptyDescription: "Sevimli bloknotingizni tanlang yoki o‘zingiznikini yarating.",
      deliveryNote: "Yetkazib berish narxi Telegramda manzilga qarab aniqlanadi.",
      checkout: "Telegramda buyurtma",
      giftBox: "Sovg‘a qutisi",
    },
    productModal: {
      collection: "SILENT COLLECTION",
      paper: "Premium qog‘oz va mustahkam muqova",
      format: "format",
      size: "o‘lcham",
    },
    order: {
      eyebrow: "BUYURTMA TAYYOR",
      title: "Buyurtmani Telegramga yuboring",
      description: "Ma’lumotlarni kiriting. Tayyor buyurtma matni to‘g‘ridan-to‘g‘ri @thatswriter chatida ochiladi.",
      name: "Ismingiz",
      namePlaceholder: "Ism va familiya",
      phone: "Telefon raqamingiz",
      phonePlaceholder: "+998 90 123 45 67",
      address: "Yetkazib berish manzili",
      addressPlaceholder: "Shahar, tuman yoki mo‘ljal",
      comment: "Qo‘shimcha izoh",
      commentPlaceholder: "Rang, qadoq yoki yetkazib berish bo‘yicha izoh",
      preview: "Buyurtma matni",
      copy: "Matnni nusxalash",
      copied: "Nusxalandi",
      send: "@thatswriter ga yuborish",
      required: "Ism va telefon raqamini kiriting.",
      directContact: "@thatswriter profilini ochish",
      greeting: "Assalomu alaykum! Quyidagi buyurtmani bermoqchiman:",
      emptyGreeting: "Assalomu alaykum! silent script. bloknotlari haqida ma’lumot olmoqchiman.",
      customer: "Mijoz",
      phoneLabel: "Telefon",
      addressLabel: "Manzil",
      commentLabel: "Izoh",
    },
  },
  en: {
    meta: {
      title: "silent script. — Notebooks for quiet minds",
      description: "Premium notebooks, planners and personalized gift sets.",
    },
    common: {
      currency: "so‘m",
      yes: "Yes",
      no: "No",
      pagesUnit: "pages",
      close: "Close",
      remove: "Remove",
      search: "Search",
      menu: "Menu",
      bag: "Cart",
      total: "Total",
      quantity: "Quantity",
      openTelegram: "Open in Telegram",
      backToShop: "View products",
    },
    announcement: "Personalized cover · Premium packaging · Delivery across Uzbekistan",
    nav: {
      home: "Home",
      shop: "Shop",
      customize: "Customize",
      about: "About",
      journal: "Journal",
      faq: "FAQ",
    },
    hero: {
      eyebrow: "WRITE SOFTLY. THINK DEEPLY.",
      title: "Notebooks for quiet minds.",
      description: "Thoughtfully designed premium notebooks for writing, planning and listening to yourself.",
      create: "Create your notebook",
      channel: "Telegram channel",
      proof: ["Personalized cover", "Premium packaging", "Across Uzbekistan"],
    },
    products: {
      eyebrow: "FEATURED COLLECTION",
      title: "Our bestsellers",
      all: "View all",
      quickView: "Quick view",
      add: "Add to cart",
      added: "Added to cart",
    },
    benefits: [
      ["Premium materials", "Carefully selected materials made to last."],
      ["Thoughtful design", "A minimal, comfortable structure that stays out of your way."],
      ["Made for you", "Choose the cover, pages and personal inscription."],
      ["Perfect for gifting", "Beautifully packaged and ready to give."],
      ["Calm aesthetic", "Natural tones that help you focus."],
    ],
    custom: {
      eyebrow: "MAKE IT YOURS",
      title: "A notebook made for you.",
      description: "Adjust every detail to your needs and style. Your choices update the preview and price instantly.",
      note: "Only one uppercase initial can be added to the cover.",
      size: "Size",
      coverColor: "Cover color",
      pageType: "Page type",
      coverText: "Cover initial",
      placeholder: "G",
      characters: "letter",
      giftBox: "Gift box",
      summary: "Your notebook",
      color: "Color",
      pages: "Pages",
      personalization: "Personalization",
      customName: "Personal Silent Notebook",
      defaultPersonalization: "S",
      pageTypes: {
        lined: "Lined",
        grid: "Grid",
        dotted: "Dotted",
        blank: "Blank",
      } satisfies Record<PageStyle, string>,
    },
    story: {
      eyebrow: "SILENT PHILOSOPHY",
      title: "Thoughts written away from the noise.",
      description: "silent script. creates notebooks for slowing down in a fast world. Every page is a space to organize ideas, remember what matters and have a quiet conversation with yourself.",
      link: "Our story",
      quote: "“A thought on paper makes the noise inside you feel quieter.”",
    },
    journal: {
      eyebrow: "JOURNAL",
      title: "Inspiration for thoughtful living",
      link: "Read on Telegram",
      items: [
        ["The power of journaling", "How ten minutes of writing each day can bring clarity to your thoughts."],
        ["Designing a life you love", "Turn ambitious goals into calm and realistic next steps."],
        ["Why quality matters", "The difference that materials and details make in everyday objects."],
        ["10 ways to stay consistent", "Keep small habits going without waiting for motivation."],
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      description: "The most important answers about ordering.",
      items: [
        ["How long does delivery take?", "Delivery usually takes 1–2 days within Namangan and 2–5 business days to other regions. The exact timing is confirmed with your order."],
        ["What can be printed on the cover?", "Only one uppercase initial can be added. The final appearance is confirmed before production."],
        ["Is prepayment required?", "A partial prepayment may be required for personalized orders. Terms for ready-made items are agreed in Telegram."],
        ["What is included in the gift box?", "A premium box, protective paper, brand card and, depending on the set, a pen or small accessory."],
      ],
    },
    newsletter: {
      eyebrow: "SILENT LETTERS",
      title: "Be the first to see new collections.",
      button: "Join the channel",
    },
    footer: {
      description: "Notebooks for quiet minds. Write, plan and reflect with clarity.",
      shop: "Shop",
      allProducts: "All products",
      customize: "Customize",
      giftSets: "Gift sets",
      help: "Support",
      delivery: "Shipping & delivery",
      orderStatus: "Order status",
      brand: "Brand",
      about: "About us",
      contact: "Contact",
      connect: "Connect",
      rights: "All rights reserved.",
    },
    search: {
      placeholder: "Search notebooks, planners or page types...",
      empty: "Nothing found.",
    },
    cart: {
      eyebrow: "CART",
      title: "Your selection",
      emptyTitle: "Your cart is empty",
      emptyDescription: "Choose a notebook you love or create your own.",
      deliveryNote: "Delivery cost is confirmed in Telegram based on your address.",
      checkout: "Order on Telegram",
      giftBox: "Gift box",
    },
    productModal: {
      collection: "SILENT COLLECTION",
      paper: "Premium paper and a durable cover",
      format: "format",
      size: "size",
    },
    order: {
      eyebrow: "ORDER READY",
      title: "Send your order on Telegram",
      description: "Enter your details. The prepared order will open directly in the @thatswriter chat.",
      name: "Your name",
      namePlaceholder: "First and last name",
      phone: "Phone number",
      phonePlaceholder: "+998 90 123 45 67",
      address: "Delivery address",
      addressPlaceholder: "City, district or landmark",
      comment: "Additional note",
      commentPlaceholder: "Notes about color, packaging or delivery",
      preview: "Order message",
      copy: "Copy message",
      copied: "Copied",
      send: "Send to @thatswriter",
      required: "Please enter your name and phone number.",
      directContact: "Open @thatswriter profile",
      greeting: "Hello! I would like to place the following order:",
      emptyGreeting: "Hello! I would like to learn more about silent script. notebooks.",
      customer: "Customer",
      phoneLabel: "Phone",
      addressLabel: "Address",
      commentLabel: "Note",
    },
  },
  ru: {
    meta: {
      title: "silent script. — Блокноты для спокойных мыслей",
      description: "Премиальные блокноты, планеры и персонализированные подарочные наборы.",
    },
    common: {
      currency: "сум",
      yes: "Да",
      no: "Нет",
      pagesUnit: "страниц",
      close: "Закрыть",
      remove: "Удалить",
      search: "Поиск",
      menu: "Меню",
      bag: "Корзина",
      total: "Итого",
      quantity: "Количество",
      openTelegram: "Открыть в Telegram",
      backToShop: "Смотреть товары",
    },
    announcement: "Персональная обложка · Премиальная упаковка · Доставка по Узбекистану",
    nav: {
      home: "Главная",
      shop: "Магазин",
      customize: "Конструктор",
      about: "О нас",
      journal: "Журнал",
      faq: "FAQ",
    },
    hero: {
      eyebrow: "WRITE SOFTLY. THINK DEEPLY.",
      title: "Блокноты для спокойных мыслей.",
      description: "Продуманные премиальные блокноты для записей, планирования и времени наедине с собой.",
      create: "Создать блокнот",
      channel: "Telegram-канал",
      proof: ["Персональная надпись", "Премиальная упаковка", "По всему Узбекистану"],
    },
    products: {
      eyebrow: "ИЗБРАННАЯ КОЛЛЕКЦИЯ",
      title: "Наши бестселлеры",
      all: "Смотреть все",
      quickView: "Быстрый просмотр",
      add: "В корзину",
      added: "Добавлено в корзину",
    },
    benefits: [
      ["Премиальные материалы", "Тщательно отобранные материалы, рассчитанные на долгую службу."],
      ["Продуманный дизайн", "Минималистичная и удобная структура, которая не мешает писать."],
      ["Создано для вас", "Выберите цвет, страницы и персональную надпись."],
      ["Для подарка", "Красиво упаковано и готово к вручению."],
      ["Спокойная эстетика", "Естественные оттенки, которые помогают сосредоточиться."],
    ],
    custom: {
      eyebrow: "СОЗДАЙТЕ СВОЙ",
      title: "Блокнот, созданный для вас.",
      description: "Настройте каждую деталь под свои задачи и стиль. Выбор сразу отражается в превью и цене.",
      note: "На обложку можно добавить только одну заглавную букву.",
      size: "Размер",
      coverColor: "Цвет обложки",
      pageType: "Тип страниц",
      coverText: "Буква на обложке",
      placeholder: "G",
      characters: "буква",
      giftBox: "Подарочная коробка",
      summary: "Ваш блокнот",
      color: "Цвет",
      pages: "Страницы",
      personalization: "Надпись",
      customName: "Персональный Silent Notebook",
      defaultPersonalization: "S",
      pageTypes: {
        lined: "Линейка",
        grid: "Клетка",
        dotted: "Точки",
        blank: "Чистые",
      } satisfies Record<PageStyle, string>,
    },
    story: {
      eyebrow: "SILENT PHILOSOPHY",
      title: "Мысли, записанные вдали от шума.",
      description: "silent script. создаёт блокноты, которые помогают замедлиться в быстром мире. Каждая страница — пространство для идей, важных воспоминаний и спокойного разговора с собой.",
      link: "Наша история",
      quote: "«Мысль на бумаге делает внутренний шум тише.»",
    },
    journal: {
      eyebrow: "ЖУРНАЛ",
      title: "Вдохновение для осознанной жизни",
      link: "Читать в Telegram",
      items: [
        ["Сила ежедневных записей", "Как десять минут письма в день помогают сделать мысли яснее."],
        ["Планирование любимой жизни", "Превращайте большие цели в спокойные и реалистичные шаги."],
        ["Почему важно качество", "Как материалы и детали меняют впечатление от повседневных вещей."],
        ["10 способов быть последовательным", "Сохраняйте маленькие привычки, не дожидаясь мотивации."],
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Часто задаваемые вопросы",
      description: "Главные ответы о процессе заказа.",
      items: [
        ["Сколько занимает доставка?", "По Намангану доставка обычно занимает 1–2 дня, в другие регионы — 2–5 рабочих дней. Точный срок сообщается при подтверждении заказа."],
        ["Какую надпись можно нанести на обложку?", "Можно добавить только одну заглавную букву. Внешний вид подтверждается до изготовления."],
        ["Нужна ли предоплата?", "Для персонализированных заказов может потребоваться частичная предоплата. Условия для готовых товаров согласуются в Telegram."],
        ["Что входит в подарочную коробку?", "Премиальная коробка, защитная бумага, фирменная карточка и, в зависимости от набора, ручка или небольшой аксессуар."],
      ],
    },
    newsletter: {
      eyebrow: "SILENT LETTERS",
      title: "Узнавайте о новых коллекциях первыми.",
      button: "Подписаться на канал",
    },
    footer: {
      description: "Блокноты для спокойных мыслей. Пишите, планируйте и размышляйте с ясностью.",
      shop: "Магазин",
      allProducts: "Все товары",
      customize: "Конструктор",
      giftSets: "Подарочные наборы",
      help: "Помощь",
      delivery: "Доставка",
      orderStatus: "Статус заказа",
      brand: "Бренд",
      about: "О нас",
      contact: "Контакты",
      connect: "Связаться",
      rights: "Все права защищены.",
    },
    search: {
      placeholder: "Поиск блокнотов, планеров и типов страниц...",
      empty: "Ничего не найдено.",
    },
    cart: {
      eyebrow: "КОРЗИНА",
      title: "Ваш выбор",
      emptyTitle: "Корзина пока пуста",
      emptyDescription: "Выберите любимый блокнот или создайте свой.",
      deliveryNote: "Стоимость доставки уточняется в Telegram в зависимости от адреса.",
      checkout: "Заказать в Telegram",
      giftBox: "Подарочная коробка",
    },
    productModal: {
      collection: "SILENT COLLECTION",
      paper: "Премиальная бумага и прочная обложка",
      format: "формат",
      size: "размер",
    },
    order: {
      eyebrow: "ЗАКАЗ ГОТОВ",
      title: "Отправьте заказ в Telegram",
      description: "Заполните данные. Готовый текст заказа откроется прямо в чате @thatswriter.",
      name: "Ваше имя",
      namePlaceholder: "Имя и фамилия",
      phone: "Номер телефона",
      phonePlaceholder: "+998 90 123 45 67",
      address: "Адрес доставки",
      addressPlaceholder: "Город, район или ориентир",
      comment: "Дополнительный комментарий",
      commentPlaceholder: "Комментарий по цвету, упаковке или доставке",
      preview: "Текст заказа",
      copy: "Копировать текст",
      copied: "Скопировано",
      send: "Отправить @thatswriter",
      required: "Укажите имя и номер телефона.",
      directContact: "Открыть профиль @thatswriter",
      greeting: "Здравствуйте! Хочу оформить следующий заказ:",
      emptyGreeting: "Здравствуйте! Хочу узнать подробнее о блокнотах silent script.",
      customer: "Клиент",
      phoneLabel: "Телефон",
      addressLabel: "Адрес",
      commentLabel: "Комментарий",
    },
  },
};
