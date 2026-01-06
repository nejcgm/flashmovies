import { useState, useEffect } from "react";
import axios from "axios";
import { DataInfoProps } from "./Interfaces";

const CACHE_TTL = 1000 * 60 * 60 * 24 * 7 * 10; // 10 weeks
const TMDB_BASE = "https://api.themoviedb.org/3";

function getCache(cacheKey: string) {
  return JSON.parse(localStorage.getItem(cacheKey) || "[]");
}

function setCache(cacheKey: string, cache: Array<[]>) {
  localStorage.setItem(cacheKey, JSON.stringify(cache));
}

function isExpired(entry: { expiresAt: number }) {
  return !entry || Date.now() > entry.expiresAt;
}

function addToLocaleStorageList(
  id: string | number,
  listStorageKey: string,
  max: number
) {
  const numId = Number(id);
  const stored: number[] = JSON.parse(
    localStorage.getItem(listStorageKey) || "[]"
  );
  const updated = [numId, ...stored.filter((x: number) => x !== numId)].slice(
    0,
    max
  );
  localStorage.setItem(listStorageKey, JSON.stringify(updated));
}

// fetch list data and store in array cache
async function fetchList(
  type: string,
  id: string | number,
  apiKey: string,
  cacheKey: string,
  maxCacheItems = 50
) {
  const cache = getCache(cacheKey);
  const numId = Number(id);
  const index = cache.findIndex(
    (m: { id: string | number }) => Number(m.id) === numId
  );

  if (index !== -1 && !isExpired(cache[index])) {
    return cache[index].data;
  }

  const res = await axios.get(`${TMDB_BASE}/${type}/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: apiKey,
    },
  });

  const data = res.data;

  const cacheEntry = { id: data.id, data, expiresAt: Date.now() + CACHE_TTL };

  if (index !== -1) {
    cache[index] = cacheEntry;
  } else {
    cache.push(cacheEntry);
    if (cache.length > maxCacheItems) {
      cache.splice(0, cache.length - maxCacheItems);
    }
  }

  setCache(cacheKey, cache);
  return data;
}

export function useLocaleStorageList(
  type: string,
  listStorageKey: string,
  cacheKey: string,
  maxItems = 20
) {
  const [data, setData] = useState<[]>([]);
  // @ts-expect-error - import.meta.env is not typed
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const loadList = async () => {
      const ids: (string | number)[] = JSON.parse(
        localStorage.getItem(listStorageKey) || "[]"
      );
      const cache = getCache(cacheKey);

      const toFetch = ids.filter((id) => {
        const numId = Number(id);
        const cached = cache.find(
          (m: { id: string | number }) => Number(m.id) === numId
        );
        return !cached || isExpired(cached);
      });

      await Promise.all(
        toFetch.map((id) => fetchList(type, id, apiKey, cacheKey))
      );

      const cacheAfterFetch = getCache(cacheKey);
      const dataList = ids
        .map(
          (id) =>
            cacheAfterFetch.find(
              (m: { id: string | number }) => Number(m.id) === Number(id)
            )?.data
        )
        .filter(Boolean);

      setData(dataList as []);
    };

    loadList();
  }, [apiKey]);

  return [
    data,
    (type: string, id: string | number) => {
      addToLocaleStorageList(id, listStorageKey, maxItems);
      fetchList(type, id, apiKey, cacheKey)
        .then(() => {
          const ids: (string | number)[] = JSON.parse(
            localStorage.getItem(listStorageKey) || "[]"
          );
          const cacheAfterFetch = getCache(cacheKey);
          const cacheMap = new Map(
            cacheAfterFetch.map(
              (m: { id: string | number; data: DataInfoProps }) => [
                Number(m.id),
                m.data,
              ]
            )
          );
          const updatedList = ids
            .map((id) => cacheMap.get(Number(id)))
            .filter(Boolean);
          setData(updatedList as []);
        })
        .catch((error) => {
          console.error("Failed to fetch list", error);
        });
    },
  ] as const;
}
