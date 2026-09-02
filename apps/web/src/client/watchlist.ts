import type {
  AddWatchlistItemData,
  RemoveWatchlistResponse,
  WatchlistFilterType,
  WatchlistItem,
  WatchlistListResponse,
} from "../interfaces/watchlist/index.ts";
import { authAxios } from "./auth";

export const listWatchlist = async (
  type: WatchlistFilterType = "all"
): Promise<WatchlistListResponse> => {
  const response = await authAxios.get<WatchlistListResponse>(
    "/public/watchlist",
    { params: { type } }
  );
  return response.data;
};

export const addWatchlistItem = async (
  data: AddWatchlistItemData
): Promise<WatchlistItem> => {
  const response = await authAxios.post<WatchlistItem>(
    "/public/watchlist",
    data
  );
  return response.data;
};

export const removeWatchlistItem = async (
  id: number
): Promise<RemoveWatchlistResponse> => {
  const response = await authAxios.delete<RemoveWatchlistResponse>(
    `/public/watchlist/${id}`
  );
  return response.data;
};
