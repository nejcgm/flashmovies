import React from "react";

interface VoteCountProps {
  voteCount: number;
  textColor?: string;
}

const VoteCount: React.FC<VoteCountProps> = ({ voteCount, textColor = "[#b3b3b3]" }) => {
  return (
    <>
      <div className={`flex gap-1 items-center text-[11px] sm:text-[12px] text-${textColor}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ipc-icon ipc-icon--thumb-up ipc-reaction-summary__likes-icon w-[12px] sm:w-[16px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="presentation"
        >
          <path d="M13.12 2.06c.58-.59 1.52-.59 2.11-.01.36.36.51.87.41 1.37L14.69 8h5.65c2.15 0 3.6 2.2 2.76 4.18l-3.26 7.61C19.52 20.52 18.8 21 18 21H9c-1.1 0-2-.9-2-2V9.01c0-.53.21-1.04.58-1.41l5.54-5.54zM9.293 8.707A1 1 0 0 0 9 9.414V18a1 1 0 0 0 1 1h7.332a1 1 0 0 0 .924-.617c1.663-4.014 2.527-6.142 2.594-6.383.07-.253.12-.587.15-1v-.002A1 1 0 0 0 20 10h-8l1.34-5.34-4.047 4.047zM3 21c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2s-2 .9-2 2v8c0 1.1.9 2 2 2z"></path>
        </svg>
        <div>{voteCount}</div>
      </div>
    </>
  );
};

export default VoteCount;
