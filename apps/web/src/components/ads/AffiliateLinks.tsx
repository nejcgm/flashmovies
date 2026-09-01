import { getAffiliateLinks } from '../../config/affiliateConfig';

declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

interface AffiliateLinkProps {
  movieTitle: string;
  className?: string;
}

export function AffiliateLinks({ movieTitle, className = "" }: AffiliateLinkProps) {
  const handleAffiliateClick = (platform: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'monetization',
        event_label: platform,
        custom_map: { custom_parameter_1: movieTitle }
      });
    }
  };

  const affiliateLinks = getAffiliateLinks(movieTitle);

  return (
    <div className={`bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-3 sm:p-4 my-4 sm:my-6 border border-[#333] mx-4 sm:mx-0 ${className}`}>
      <h3 className="text-sm sm:text-lg font-semibold text-[#f5c518] mb-2 sm:mb-3 text-center sm:text-left">
        🎬 Amazon and AliExpress Deals for &ldquo;{movieTitle}&rdquo;
      </h3>
      
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-4 justify-center sm:justify-start">
        {affiliateLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAffiliateClick(link.name)}
            className={`${link.bgColor} ${link.textColor} px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${link.hoverColor} transition-colors text-xs sm:text-sm font-medium shadow-lg text-center min-w-[130px] sm:min-w-[140px]`}
          >
            <span className="block sm:hidden">{link.name}</span>
            <span className="hidden sm:block">{link.name} - {link.offer}</span>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center sm:text-left">
         <strong>Affiliate Disclosure:</strong> We earn a commission when you sign up through our links at no extra cost to you. 
        This helps us keep Flash Movies free and running!
      </p>
    </div>
  );
};
