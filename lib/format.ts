/**
 * Formats prices deterministically on both the server and the browser.
 * Avoiding Intl here prevents locale/polyfill differences during hydration.
 */
export function formatPrice(value: number, currency: string): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(Math.trunc(value)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${grouped} ${currency}`;
}
