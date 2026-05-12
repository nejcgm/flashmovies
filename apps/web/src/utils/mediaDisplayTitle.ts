/**
 * Single display title for movies / TV / people across info, watch, and list UIs.
 * Matches TMDB: localized title, fall back to original_title, then TV name.
 */
export function mediaDisplayTitle(i: {
  title?: string;
  name?: string;
  original_title?: string;
}): string {
  const t = (i.title ?? "").trim();
  const n = (i.name ?? "").trim();
  const o = (i.original_title ?? "").trim();
  return t || n || o || "Untitled";
}

/** "(2008)" or "" if the date is missing or invalid. */
export function mediaYearInParens(
  releaseDate?: string,
  firstAirDate?: string,
  birthday?: string,
): string {
  const raw = releaseDate || firstAirDate || birthday;
  if (!raw || typeof raw !== "string") return "";
  const y = new Date(raw).getFullYear();
  if (!Number.isFinite(y)) return "";
  return `(${y})`;
}

/** ` (2008)` for headings / SEO, or "" */
export function mediaYearSuffixSpaced(
  releaseDate?: string,
  firstAirDate?: string,
  birthday?: string,
): string {
  const inner = mediaYearInParens(releaseDate, firstAirDate, birthday);
  return inner ? ` ${inner}` : "";
}
