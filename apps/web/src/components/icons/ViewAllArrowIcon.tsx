import React from "react";

/** Small diagonal (northeast) arrow for “View all” style links */
const ViewAllArrowIcon: React.FC<{ className?: string }> = ({
  className = "h-4 w-4 shrink-0",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M7 17L17 7M17 7H9M17 7v8" />
  </svg>
);

export default ViewAllArrowIcon;
