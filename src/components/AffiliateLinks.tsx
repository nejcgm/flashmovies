import React from 'react';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

interface AffiliateLinkProps {
  movieTitle: string;
  className?: string;
}

const AffiliateLinks: React.FC<AffiliateLinkProps> = ({ movieTitle, className = "" }) => {
  // Track affiliate clicks for analytics
  const handleAffiliateClick = (platform: string) => {
    // Google Analytics event tracking (if you have GA setup)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'monetization',
        event_label: platform,
        custom_map: { custom_parameter_1: movieTitle }
      });
    }
    
    // You can also send to your own analytics endpoint
    // fetch('/api/track-affiliate-click', { ... });
  };

  const affiliateLinks = [
    {
      name: "Amazon Prime Video",
      url: `https://www.amazon.com/dp/B00DBYBNEE?tag=flashmovies-20&linkCode=osi&th=1&psc=1`,
      bgColor: "bg-[#00a8e1]",
      hoverColor: "hover:bg-[#0099cc]",
      textColor: "text-white",
      offer: "Start Free Trial",
      commission: "4-8% of all Amazon purchases"
    },
    {
      name: "Watch on Prime Video",
      url: `https://www.amazon.com/s?k=${encodeURIComponent(movieTitle)}&i=instant-video&tag=flashmovies-20&ref=sr_nr_n_1`,
      bgColor: "bg-[#1a252f]",
      hoverColor: "hover:bg-[#2a3540]",
      textColor: "text-white",
      offer: "Rent/Buy Movie",
      commission: "4-8% commission"
    },
    
    // FAST MONEY: High-converting VPN links (no approval needed)
    {
      name: "🔒 NordVPN",
      url: `https://go.nordvpn.net/aff_c?offer_id=15&aff_id=YOUR_ID&url_id=902`,
      bgColor: "bg-[#4687ff]",
      hoverColor: "hover:bg-[#3d7aff]",
      textColor: "text-white",
      offer: "73% OFF Deal",
      commission: "$100+ per signup"
    },
    {
      name: "🎮 ExpressVPN",
      url: `https://www.expressvpn.com/order?a_fid=YOUR_ID&a_bid=f6b6fbf9`,
      bgColor: "bg-[#da020e]",
      hoverColor: "hover:bg-[#c4010c]",
      textColor: "text-white",
      offer: "49% OFF + 3 Months",
      commission: "$77 per signup"
    },

    {
      name: "Movie Merchandise",
      url: `https://www.amazon.com/s?k=${encodeURIComponent(movieTitle)}+movie+merchandise&tag=flashmovies-20&ref=sr_nr_n_2`,
      bgColor: "bg-[#ff9900]",
      hoverColor: "hover:bg-[#e68900]",
      textColor: "text-black",
      offer: "Shop Now",
      commission: "4-8% commission"
    },
    {
      name: "Fire TV Devices",
      url: `https://www.amazon.com/s?k=fire+tv+stick+4k&tag=flashmovies-20&ref=sr_nr_n_3`,
      bgColor: "bg-[#232f3e]",
      hoverColor: "hover:bg-[#1a252f]",
      textColor: "text-white",
      offer: "Shop Devices",
      commission: "8-10% commission"
    }
    
    /* COMMENTED OUT - TO BE ACTIVATED LATER WHEN APPROVED
    
    // Netflix - No direct affiliate program, will use VPN partners instead
    {
      name: "Netflix",
      url: `https://netflix.com/search?q=${encodeURIComponent(movieTitle)}&utm_source=flashmovies&utm_medium=affiliate&utm_campaign=movie_search`,
      bgColor: "bg-[#e50914]",
      hoverColor: "hover:bg-[#f40612]",
      textColor: "text-white",
      offer: "30 Day Free Trial",
      commission: "$40-50 per signup" 
    },
    
    // Hulu - Apply through Impact Radius or ShareASale when available
    {
      name: "Hulu",
      url: `https://secure.hulu.com/account/signup?utm_source=flashmovies&utm_medium=affiliate&search=${encodeURIComponent(movieTitle)}`,
      bgColor: "bg-[#1ce783]",
      hoverColor: "hover:bg-[#17d974]",
      textColor: "text-black",
      offer: "$1.99/month",
      commission: "$25-35 per signup"
    },
    
    // Disney+ - Apply through Impact Radius when available
    {
      name: "Disney+",
      url: `https://www.disneyplus.com/sign-up?cid=DSS-Affiliate-flashmovies&search=${encodeURIComponent(movieTitle)}`,
      bgColor: "bg-[#113ccf]",
      hoverColor: "hover:bg-[#0f35b8]",
      textColor: "text-white",
      offer: "Bundle Available",
      commission: "$20-30 per signup"
    }
    
    */
  ];

  return (
    <div className={`bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-4 my-6 border border-[#333] ${className}`}>
      <h3 className="text-lg font-semibold text-[#f5c518] mb-3 text-center sm:text-left">
        🎬 Watch &ldquo;{movieTitle}&rdquo; on Premium Platforms
      </h3>
      
      <div className="flex flex-wrap gap-3 mb-4 justify-center sm:justify-start">
        {affiliateLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAffiliateClick(link.name)}
            className={`${link.bgColor} ${link.textColor} px-4 py-2 rounded-lg ${link.hoverColor} transition-colors text-sm font-medium shadow-lg text-center min-w-[140px] sm:min-w-0`}
          >
            {link.name} - {link.offer}
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center sm:text-left">
        💰 <strong>Affiliate Disclosure:</strong> We earn a commission when you sign up through our links at no extra cost to you. 
        This helps us keep Flash Movies free and running!
      </p>
    </div>
  );
};

export default AffiliateLinks;