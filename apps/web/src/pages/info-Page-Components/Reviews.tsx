import React, { useEffect, useState } from "react";
import { fetchSpecific } from "../../utils/fetching.js";
import ReviewCard from "./ReviewCard";
//import { MediaType } from "../../functions/Interfaces.js";

interface ReviewsProps {
  movieId: string | number | null;
  type: string | null;
}

interface ReviewCardProps {
  avatar_path: string;
  username: string;
  rating: number;
}
interface ReviewCardItem {
  author_details: ReviewCardProps;
  created_at: string;
  content: string;
}

const Reviews: React.FC<ReviewsProps> = ({ movieId, type }) => {
  const [review, setReview] = useState<ReviewCardItem[]>([]);
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
            .map((item: ReviewCardItem, index: number) => (
              <ReviewCard
                key={index}
                avatar={item?.author_details?.avatar_path}
                username={item?.author_details?.username}
                userRating={item?.author_details?.rating}
                timestamp={item?.created_at}
                content={item?.content}
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

export default Reviews;
