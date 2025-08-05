import React, { useState } from "react";
const PersonPlaceholder = "/dark-mode-avatar-placeholder.png";
import Rating from "../../components/Rating";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";

interface ReviewCardProps {
  avatar: string;
  username: string;
  userRating: number;
  timestamp: string;
  content: string;
}
const ReviewCard: React.FC<ReviewCardProps> = ({
  avatar,
  username,
  userRating,
  timestamp,
  content,
  
}) => {
  const ContentLength = content.length;
  const [expand, setExpand] = useState(250);

  return (
    <>
      <div className="flex p-2 sm:px-6 sm:py-4 pr-[32px] rounded-lg gap-3  bg-[#101010]">
        <div>
          <img
            className="rounded-full h-[32px] w-[32px] sm:h-[48px] sm:w-[48px] lg:h-[70px] lg:w-[70px] "
            src={
              avatar ? `https://image.tmdb.org/t/p/w200/${avatar}` : PersonPlaceholder
            }
            alt=""
          />
        </div>
        <div className="flex flex-1 flex-col font-roboto text-white">
          <div className="flex gap-4 items-center text-[12px] sm:text-[16px]">
            <div>{timestamp.split("T", 1)}</div>
            <Rating rating={userRating} />
          </div>
          <div className="text-[18px] sm:text-[28px] text-[#F5C518]">{username}</div>
          <div className="text-[12px] sm:text-[16px]">
            {/* <div dangerouslySetInnerHTML={{ __html: content.slice(0, expand)}}/> */}
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{DOMPurify.sanitize(content.slice(0, expand))}</ReactMarkdown>
            <button
              onClick={() => {
                setExpand((prevValue) =>
                  prevValue === 250 ? ContentLength : 250
                );
              }}
              className="text-[#BBBBBB]"
            >
              {ContentLength < 250
                ? " "
                : expand == 250
                ? " ...Read More"
                : " ...View Less"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewCard;
