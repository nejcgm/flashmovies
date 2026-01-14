import React from "react";

interface CustomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const CustomButton = ({ children, onClick, className, type="button", disabled=false }: CustomButtonProps) => {
  return (
    <button
      className={`flex self-start text-black px-4 py-2 justify-center items-center
         rounded-md gap-2 hover:bg-yellow-600 transition-all duration-300 ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;
