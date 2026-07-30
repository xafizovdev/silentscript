import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { gunzipSync } from "node:zlib";
import { storefrontTsx } from "./storefront-tsx.mjs";
import { storefrontCss } from "./storefront-css.mjs";
import { heroFile } from "./storefront-hero.mjs";

const files = {
  "components/exact-storefront/ExactStorefront.tsx": storefrontTsx,
  "components/exact-storefront/exact.css": storefrontCss,
  [heroFile.path]: heroFile.payload,
};
for (const [path, payload] of Object.entries(files)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, gunzipSync(Buffer.from(payload, "base64")));
}
console.log("Silent Script storefront generated.");
