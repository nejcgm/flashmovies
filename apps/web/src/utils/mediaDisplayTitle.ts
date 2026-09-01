
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

export function mediaYearSuffixSpaced(
  releaseDate?: string,
  firstAirDate?: string,
  birthday?: string,
): string {
  const inner = mediaYearInParens(releaseDate, firstAirDate, birthday);
  return inner ? ` ${inner}` : "";
}
