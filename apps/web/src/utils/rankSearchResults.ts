import fuzzysort from "fuzzysort";
import type { SearchRankable } from "../interfaces/search/index.ts";

function fuzzyScore(query: string, r: SearchRankable): number {
  const q = query.trim();
  if (!q) return 0;
  const title = (r.title || "").trim();
  const name = (r.name || "").trim();
  let best = -Infinity;
  if (title) {
    best = Math.max(best, fuzzysort.single(q, title)?.score ?? -Infinity);
  }
  if (name) {
    best = Math.max(best, fuzzysort.single(q, name)?.score ?? -Infinity);
  }
  return Number.isFinite(best) ? best : 0;
}

function qualityScore(r: SearchRankable): number {
  let s = 0;
  if (r.poster_path || r.profile_path) s += 800;
  const votes = r.vote_count ?? 0;
  s += Math.min(350, Math.log1p(votes) * 42);
  const pop = r.popularity ?? 0;
  s += Math.min(250, pop * 3.5);
  return s;
}

export function rankSearchResults<T extends SearchRankable>(
  query: string,
  results: T[]
): T[] {
  const q = query.trim();
  if (!q || results.length <= 1) {
    return results;
  }

  const scored = results.map((r, idx) => ({
    r,
    idx,
    fuzzy: fuzzyScore(q, r),
    quality: qualityScore(r),
  }));

  const FUZZY_EPS = 0.35;
  scored.sort((a, b) => {
    if (Math.abs(a.fuzzy - b.fuzzy) > FUZZY_EPS) {
      return b.fuzzy - a.fuzzy;
    }
    if (b.quality !== a.quality) return b.quality - a.quality;
    return a.idx - b.idx;
  });

  return scored.map((x) => x.r);
}
