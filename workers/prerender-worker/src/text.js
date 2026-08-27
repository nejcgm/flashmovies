/**
 * @param {string} text
 */
export function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * @param {string} text
 * @param {number} max
 */
export function truncate(text, max) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  const sliced = value.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

/**
 * @param {string | null | undefined} date
 */
export function yearFromDate(date) {
  if (!date || typeof date !== "string") return "";
  const year = new Date(date).getFullYear();
  return Number.isFinite(year) ? String(year) : "";
}

/**
 * Same display-title rule as apps/web/src/utils/mediaDisplayTitle.ts
 * @param {{ title?: string, name?: string, original_title?: string }} item
 */
export function mediaDisplayTitle(item) {
  const t = (item?.title ?? "").trim();
  const n = (item?.name ?? "").trim();
  const o = (item?.original_title ?? "").trim();
  return t || n || o || "Untitled";
}

/**
 * @param {string} str
 */
export function formatListTitle(str) {
  if (!str) return "";
  return str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
