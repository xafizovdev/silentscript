import { existsSync, readFileSync, statSync } from "node:fs";

const checks = [
  ["components/exact-storefront/ExactStorefront.tsx", "NIMA UCHUN SILENT SCRIPT"],
  ["components/exact-storefront/exact.css", ".ex-benefits"],
];
for (const [path, marker] of checks) {
  if (!existsSync(path) || !readFileSync(path, "utf8").includes(marker)) {
    throw new Error(`Storefront verification failed: ${path}`);
  }
}
if (!existsSync("public/hero-journal.jpg") || statSync("public/hero-journal.jpg").size < 9000) {
  throw new Error("Hero image generation failed");
}
console.log("Silent Script storefront verified.");
