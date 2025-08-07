import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const CustomButton = ({ children, onClick, className }: CustomButtonProps) => {
  return (
    <button
      className={`bg-yellow-500 flex self-start text-black px-4 py-2 justify-center items-center
         rounded-md gap-2 hover:bg-yellow-600 transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
