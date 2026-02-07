import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`text-center mb-8 sm:mb-12 ${className}`}>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h1>
      {subtitle && <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;
