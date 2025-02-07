import React, { useEffect, useState } from "react";
import { fetchSpecific } from "../functions/Fetching.js";
import ReviewCard from "./reviewCard";
const Reviews = ({ movieId, type }) => {
  const [review, setReview] = useState([]);
  const [expand, setExpand] = useState(5);
  const ContentLength = review?.results?.length;

  useEffect(() => {
    const loadReview = async () => {
      const data = await fetchSpecific(type, movieId, "/reviews", "", "");
      setReview(data);
    };
    loadReview();
  }, [movieId]);

  return (
    <>
      {ContentLength !== 0 ? (
        <div className="flex self-center w-[70%] flex-col gap-4 mb-[32px] ">
          <div className="font-roboto text-[32px] font-bold text-[#F5C518]">
            Reviews
          </div>
          {review?.results?.slice(0, expand).map((item, index) => (
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
              className="text-white py-2 px-6 bg-[#101010] flex self-center rounded-full text-[#BBBBBB]"
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
