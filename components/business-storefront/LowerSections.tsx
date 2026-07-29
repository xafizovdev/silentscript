"use client";

import type { Locale } from "./shared";
import { SectionHeading } from "./shared";
import { copy } from "./copy";

export function LowerSections({ locale, scrollTo }: { locale: Locale; scrollTo: (id: string) => void }) {
  const t = copy[locale];
  return (
    <>
      <section className="ex-values" aria-label="Silent Script afzalliklari">
        {[
          ["01", locale === "uz" ? "100% qo‘l mehnati" : "100% ручная работа", locale === "uz" ? "Har bir detal ustaxonada alohida tayyorlanadi." : "Каждая деталь создаётся вручную в мастерской."],
          ["02", locale === "uz" ? "Cheklangan nusxa" : "Ограниченный тираж", locale === "uz" ? "Ommaviy ishlab chiqarish emas — har biri o‘ziga xos." : "Не массовое производство — каждое изделие уникально."],
          ["03", locale === "uz" ? "Siz uchun moslashtiriladi" : "Персонализация", locale === "uz" ? "Rang, ip va qog‘oz turini o‘zingiz tanlaysiz." : "Вы сами выбираете кожу, нить и бумагу."],
          ["04", locale === "uz" ? "Uzoq xizmat qiladi" : "Служит годами", locale === "uz" ? "Ichki daftarni almashtirib, charm g‘ilofdan qayta foydalanasiz." : "Меняйте внутренний блокнот и продолжайте использовать обложку."],
        ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
      </section>

      <section className="ex-story" id="about">
        <div className="ex-story__media"><div className="ex-story__stamp">silent script.</div></div>
        <div className="ex-story__copy">
          <p className="ex-kicker">{t.storyEyebrow}</p>
          <h2>{t.storyTitle}</h2>
          <p>{t.storyText}</p>
          <ul><li>{t.storyPoint1}</li><li>{t.storyPoint2}</li><li>{t.storyPoint3}</li></ul>
          <button type="button" onClick={() => scrollTo("design")}>{t.ctaButton}<span>→</span></button>
        </div>
      </section>

      <section className="ex-process">
        <SectionHeading eyebrow={t.processEyebrow} title={t.processTitle}/>
        <div className="ex-process__grid">
          {[["01", t.step1Title, t.step1Text], ["02", t.step2Title, t.step2Text], ["03", t.step3Title, t.step3Text]].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="ex-reviews" id="reviews">
        <SectionHeading eyebrow={t.reviewsEyebrow} title={t.reviewsTitle}/>
        <div className="ex-reviews__grid">
          {[["M", "Madina", t.review1], ["S", "Sardor", t.review2], ["N", "Nilufar", t.review3]].map(([initial, name, text]) => (
            <article key={name}><div className="ex-stars">★★★★★</div><blockquote>“{text}”</blockquote><footer><span>{initial}</span><div><strong>{name}</strong><small>Silent Script customer</small></div></footer></article>
          ))}
        </div>
      </section>

      <section className="ex-information">
        <div className="ex-information__policy"><p className="ex-kicker">INFORMATION</p><h2>{t.policyTitle}</h2><p>{t.policyText}</p><a href="https://t.me/thatswriter" target="_blank" rel="noreferrer">@thatswriter →</a></div>
        <div className="ex-faq"><p className="ex-kicker">{t.faqEyebrow}</p><h2>{t.faqTitle}</h2>{[[t.faq1q,t.faq1a],[t.faq2q,t.faq2a],[t.faq3q,t.faq3a],[t.faq4q,t.faq4a]].map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="ex-cta"><div><p>SILENT SCRIPT</p><h2>{t.ctaTitle}</h2><span>{t.ctaText}</span></div><button type="button" onClick={() => scrollTo("design")}>{t.ctaButton}<span>→</span></button></section>

      <footer className="ex-footer" id="contact">
        <div className="ex-footer__main">
          <div><a className="ex-logo ex-logo--footer" href="#home"><span className="ex-logo__mark"/><span>silent script.</span></a><p>{t.footerText}</p></div>
          <div><h3>{locale === "uz" ? "Navigatsiya" : "Навигация"}</h3><a href="#home">{t.home}</a><a href="#products">{t.products}</a><a href="#design">{t.builder}</a><a href="#about">{t.about}</a></div>
          <div><h3>{locale === "uz" ? "Aloqa" : "Контакты"}</h3><a href="https://t.me/thatswriter" target="_blank" rel="noreferrer">Telegram: @thatswriter</a><a href="https://instagram.com/silentscriptuz" target="_blank" rel="noreferrer">Instagram: @silentscriptuz</a></div>
          <div><h3>{locale === "uz" ? "Buyurtma" : "Заказ"}</h3><button type="button" onClick={() => scrollTo("products")}>{t.products}</button><button type="button" onClick={() => scrollTo("design")}>{t.builder}</button><a href="/admin">Admin panel</a></div>
        </div>
        <div className="ex-footer__bottom"><span>© 2026 Silent Script. {t.rights}</span><span>{t.delivery}</span></div>
      </footer>
    </>
  );
}
