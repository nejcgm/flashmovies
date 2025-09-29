import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const CustomButton = ({ children, onClick, className, type="button" }: CustomButtonProps) => {
  return (
    <button
      className={`flex self-start text-black px-4 py-2 justify-center items-center
         rounded-md gap-2 hover:bg-yellow-600 transition-all duration-300 ${className}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default CustomButton;
