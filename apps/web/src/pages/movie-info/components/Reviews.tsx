import { useEffect, useState } from "react";
import { fetchSpecific } from "../../../client/tmdb.js";
import { ReviewCard } from "./";
import type { TmdbReview } from "../../../interfaces/tmdb/index.ts";

interface ReviewsProps {
  movieId: string | number | null;
  type: string | null;
}

export function Reviews({ movieId, type }: ReviewsProps) {
  const [review, setReview] = useState<TmdbReview[]>([]);
  const [expand, setExpand] = useState(5);

  const ContentLength = review?.length;

  useEffect(() => {
    const loadReview = async () => {
      const data = await fetchSpecific(type, movieId, "/reviews", null, "");
      if (data) {
        setReview(data.results);
      }
    };
    if (movieId === "1439112" && type === "movie") {
      return;
    }
    loadReview();
  }, [movieId, type]);

  return (
    <>
      {ContentLength !== 0 ? (
        <div className="flex self-center w-full lg:w-[70%] flex-col gap-4 mb-[32px] ">
          <div className="font-roboto text-[24px] sm:text-[32px] font-bold text-[#F5C518]">
            Reviews
          </div>
          {review
            ?.slice(0, expand)
            .map((item, index) => (
              <ReviewCard
                key={index}
                avatar={item.author_details.avatar_path ?? ""}
                username={item.author_details.username}
                userRating={item.author_details.rating ?? 0}
                timestamp={item.created_at}
                content={item.content}
              />
            ))}
          {ContentLength && ContentLength > 5 && (
            <button
              onClick={() => {
                setExpand((prevValue) => (prevValue === 5 ? ContentLength : 5));
              }}
              className="py-2 px-6 bg-[#101010] flex self-center rounded-full text-[#BBBBBB]"
            >
              {expand == 5 ? "View All" : "View Less"}
            </button>
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
};

