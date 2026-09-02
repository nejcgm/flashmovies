import { useState } from "react";
import { useProUpsell } from "../../context/ProUpsellContext";
import { useUser } from "../../context/UserContext";
import { useWatchlist } from "../../context/WatchlistContext";
import type { WatchlistMediaType } from "../../interfaces/watchlist/index.ts";

interface WatchlistHeartButtonProps {
  tmdbId: string | null;
  mediaType: string | null;
  variant?: "overlay" | "inline" | "labeled";
  size?: "sm" | "md";
  className?: string;
}

export function WatchlistHeartButton({
  tmdbId,
  mediaType,
  variant = "overlay",
  size = "md",
  className = "",
}: WatchlistHeartButtonProps) {
  const { isLoggedIn, isPro, isLoading: userLoading } = useUser();
  const { openProUpsell } = useProUpsell();
  const { isInWatchlist, toggleWatchlist, isReady } = useWatchlist();
  const [pending, setPending] = useState(false);

  if (!tmdbId || (mediaType !== "movie" && mediaType !== "tv")) {
    return null;
  }

  const typedMediaType = mediaType as WatchlistMediaType;
  const numericId = Number(tmdbId);
  const saved =
    isLoggedIn && isPro && isReady && isInWatchlist(numericId, typedMediaType);

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (pending || userLoading) {
      return;
    }

    if (!isLoggedIn || !isPro) {
      openProUpsell("watchlist");
      return;
    }

    setPending(true);
    try {
      await toggleWatchlist(numericId, typedMediaType);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={saved}
      disabled={pending}
      onClick={handleClick}
      className={`z-10 flex items-center justify-center text-white transition-colors disabled:opacity-60 ${
        variant === "labeled"
          ? "absolute right-3 top-3 h-auto w-auto gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm hover:bg-black/75 sm:right-4 sm:top-4 sm:px-3 sm:text-[13px]"
          : `${
              size === "sm" ? "h-6 w-6" : "h-8 w-8"
            } rounded-full ${
              variant === "inline"
                ? "relative shrink-0 bg-white/10 hover:bg-white/20"
                : "absolute bg-black/55 backdrop-blur-sm hover:bg-black/75"
            } ${
              variant === "overlay"
                ? size === "sm"
                  ? "right-0.5 top-0.5"
                  : "right-2 top-2"
                : ""
            }`
      } ${className}`}
    >
      <svg
        className={`shrink-0 ${saved ? "text-[#F5C518]" : "text-white"} ${
          variant === "labeled"
            ? "h-3.5 w-3.5 sm:h-4 sm:w-4"
            : size === "sm"
              ? "h-3 w-3"
              : "h-4 w-4"
        }`}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={saved ? 0 : 2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {variant === "labeled" && (
        <span className="whitespace-nowrap">
          {saved ? "In watchlist" : "Add to watchlist"}
        </span>
      )}
    </button>
  );
}
