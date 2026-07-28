const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }
function write(rel, value) { const file = path.join(root, rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); }
function replaceRequired(source, oldValue, newValue, label) {
  if (source.includes(newValue)) return source;
  if (!source.includes(oldValue)) throw new Error(`Could not find ${label} block`);
  return source.replace(oldValue, newValue);
}

const oldInput = "            <fieldset>\n              <legend>{t.custom.coverText}</legend>\n              <input\n                value={custom.personalization}\n                maxLength={15}\n                onChange={(event) => setCustom((current) => ({ ...current, personalization: event.target.value }))}\n                placeholder={t.custom.placeholder}\n              />\n              <small>\n                {custom.personalization.length}/15 {t.custom.characters}\n              </small>\n            </fieldset>";
const newInput = "            <fieldset className=\"initial-field\">\n              <legend>{t.custom.coverText}</legend>\n              <div className=\"initial-input-row\">\n                <input\n                  id=\"cover-initial\"\n                  name=\"coverInitial\"\n                  value={custom.personalization}\n                  maxLength={1}\n                  inputMode=\"text\"\n                  autoComplete=\"off\"\n                  autoCapitalize=\"characters\"\n                  spellCheck={false}\n                  aria-describedby=\"cover-initial-help\"\n                  onChange={(event) => {\n                    const letter = Array.from(event.target.value.normalize(\"NFC\").replace(/[^\\p{L}]/gu, \"\"))[0] ?? \"\";\n                    setCustom((current) => ({ ...current, personalization: letter.toUpperCase() }));\n                  }}\n                  placeholder={t.custom.placeholder}\n                />\n                <span id=\"cover-initial-help\" className=\"initial-counter\" aria-live=\"polite\">\n                  {Array.from(custom.personalization).length}/1 {t.custom.characters}\n                </span>\n              </div>\n            </fieldset>";
const oldFooter = "            <div className=\"footer-logo\">\n              <Image src=\"/brand-avatar.svg\" alt=\"silent script.\" width={58} height={58} />\n              <span>silent script.</span>\n            </div>";
const newFooter = "            <div className=\"footer-logo\">\n              <span className=\"footer-avatar-frame\">\n                <Image\n                  src=\"/brand-avatar.svg\"\n                  alt=\"silent script. brend avatari\"\n                  width={82}\n                  height={82}\n                  sizes=\"82px\"\n                />\n              </span>\n              <span className=\"footer-wordmark\">silent script.</span>\n            </div>";
let page = read("app/page.tsx");
page = replaceRequired(page, oldInput, newInput, "personalization");
page = replaceRequired(page, oldFooter, newFooter, "footer logo");
write("app/page.tsx", page);

let copy = read("data/site-copy.ts");
const replacements = {"Personalizatsiya 15 ta belgigacha yoziladi.": "Muqovaga faqat bitta bosh harf yoziladi.", "Muqovadagi yozuv": "Muqovadagi bosh harf", "Masalan: Mening fikrlarim": "G", "characters: \"belgi\"": "characters: \"harf\"", "defaultPersonalization: \"Mening fikrlarim\"": "defaultPersonalization: \"S\"", "15 tagacha belgidan iborat ism, so‘z yoki qisqa ibora. Buyurtmadan oldin yozuv ko‘rinishi tasdiqlanadi.": "Muqovaga faqat bitta bosh harf tushiriladi. Yakuniy ko‘rinish buyurtmadan oldin tasdiqlanadi.", "Personalization supports up to 15 characters.": "Only one uppercase initial can be added to the cover.", "coverText: \"Cover text\"": "coverText: \"Cover initial\"", "For example: My thoughts": "G", "characters: \"characters\"": "characters: \"letter\"", "defaultPersonalization: \"My thoughts\"": "defaultPersonalization: \"S\"", "A name, word or short phrase of up to 15 characters. The final appearance is confirmed before production.": "Only one uppercase initial can be added. The final appearance is confirmed before production.", "Персональная надпись — до 15 символов.": "На обложку можно добавить только одну заглавную букву.", "Надпись на обложке": "Буква на обложке", "Например: Мои мысли": "G", "characters: \"символов\"": "characters: \"буква\"", "defaultPersonalization: \"Мои мысли\"": "defaultPersonalization: \"S\"", "Имя, слово или короткую фразу до 15 символов. Внешний вид надписи подтверждается до изготовления.": "Можно добавить только одну заглавную букву. Внешний вид подтверждается до изготовления."};
for (const [from, to] of Object.entries(replacements)) {
  if (!copy.includes(from) && !copy.includes(to)) throw new Error(`Could not find translation: ${from}`);
  copy = copy.split(from).join(to);
}
write("data/site-copy.ts", copy);

const cssMarker = "/* Silent Script one-letter personalization and exact brand avatar */";
let styles = read("app/globals.css");
if (!styles.includes(cssMarker)) styles += "\n\n/* Silent Script one-letter personalization and exact brand avatar */\n.initial-input-row { display: flex; align-items: center; gap: 12px; }\n.initial-field input {\n  width: 88px;\n  min-height: 54px;\n  padding: 8px 12px;\n  text-align: center;\n  text-transform: uppercase;\n  font-family: var(--serif);\n  font-size: 30px;\n  line-height: 1;\n  letter-spacing: .04em;\n}\n.initial-field input::placeholder { color: rgba(43, 36, 30, .34); }\n.initial-counter { color: var(--muted); font-size: 12px; white-space: nowrap; }\n.footer-avatar-frame {\n  width: 82px;\n  height: 82px;\n  flex: 0 0 82px;\n  display: inline-grid;\n  place-items: center;\n  overflow: hidden;\n  border: 1px solid rgba(255,255,255,.25);\n  border-radius: 10px;\n  background: #b9c88d;\n  box-shadow: 0 14px 34px rgba(25,22,16,.18);\n}\n.footer-avatar-frame img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }\n.footer-wordmark { line-height: 1; }\n@media (max-width: 520px) {\n  .footer-logo { align-items: center; }\n  .footer-avatar-frame { width: 72px; height: 72px; flex-basis: 72px; }\n  .footer-wordmark { font-size: 25px; }\n}\n";
write("app/globals.css", styles);

const avatarSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 320\" role=\"img\" aria-label=\"silent script.\">\n  <rect x=\"0\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"20\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"40\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"60\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"80\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"100\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"120\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"140\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"160\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"180\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"200\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"220\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"240\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"260\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <rect x=\"280\" y=\"0\" width=\"20\" height=\"320\" fill=\"#5b493c\"/>\n  <rect x=\"300\" y=\"0\" width=\"20\" height=\"320\" fill=\"#b5c78d\"/>\n  <text x=\"160\" y=\"172\" text-anchor=\"middle\" fill=\"#fffdf8\" font-family=\"Courier New, Courier, monospace\" font-size=\"28\" font-weight=\"700\" letter-spacing=\"-1\">silent script.</text>\n</svg>\n";
write("app/icon.svg", avatarSvg);
write("app/apple-icon.svg", avatarSvg);
write("public/brand-avatar.svg", avatarSvg);
write("app/manifest.ts", "import type { MetadataRoute } from \"next\";\n\nexport default function manifest(): MetadataRoute.Manifest {\n  return {\n    name: \"silent script.\",\n    short_name: \"silent script.\",\n    description: \"Xotirjam fikrlar uchun premium bloknotlar.\",\n    start_url: \"/\",\n    display: \"standalone\",\n    background_color: \"#f5f1e8\",\n    theme_color: \"#626947\",\n    icons: [{ src: \"/brand-avatar.svg\", sizes: \"320x320\", type: \"image/svg+xml\", purpose: \"any\" }],\n  };\n}\n");

const changelogPath = "CHANGELOG.md";
let changelog = fs.existsSync(path.join(root, changelogPath)) ? read(changelogPath) : "# Changelog\n";
const entry = "\n## Brand avatar and one-letter personalization\n- Uses the uploaded Silent Script artwork for favicon and footer branding.\n- Limits cover personalization to one uppercase letter in UZ, EN and RU.\n";
if (!changelog.includes("## Brand avatar and one-letter personalization")) write(changelogPath, changelog + entry);

for (const rel of ["scripts/apply-upgrade.cjs", ".github/workflows/apply-upgrade.yml"]) {
  const file = path.join(root, rel);
  if (fs.existsSync(file)) fs.rmSync(file);
}
console.log("Silent Script upgrade applied successfully.");
