import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', highlighted = false }) => {
  return (
    <div
      className={`bg-[#1a1a1a] rounded-xl shadow-2xl p-6 sm:p-8 border 
                  ${highlighted ? 'border-[#f5c518] ring-2 ring-[#f5c518]/20' : 'border-gray-800'} 
                  ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
