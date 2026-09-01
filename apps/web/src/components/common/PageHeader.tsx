
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <div className={`text-center mb-8 sm:mb-12 md:mb-5 ${className}`}>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h1>
      {subtitle && <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">{subtitle}</p>}
    </div>
  );
};

