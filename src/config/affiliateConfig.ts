export interface AffiliateLink {
  name: string;
  url: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  offer: string;
  commission: string;
}

export const getAffiliateLinks = (movieTitle: string): AffiliateLink[] => [
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
    name: "Special Deals",
    url: `https://www.amazon.com/dp/B0DYVMVZSY?ref=t_ac_view_request_product_image&campaignId=amzn1.campaign.1ZTS53JLD0ICW&linkCode=tr1&tag=flashmovies-20&linkId=amzn1.campaign.1ZTS53JLD0ICW_1755281007693`,
    bgColor: "bg-[#ff1a1a]",
    hoverColor: "hover:bg-[#cc0000]",
    textColor: "text-white",
    offer: "Samsung Galaxy S25 - 20%",
    commission: "4-8% commission"
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
    name: "Watch on Prime Video",
    url: `https://www.amazon.com/s?k=${encodeURIComponent(movieTitle)}&i=instant-video&tag=flashmovies-20&ref=sr_nr_n_1`,
    bgColor: "bg-[#0073e6]",
    hoverColor: "hover:bg-[#005bb5]",
    textColor: "text-white",
    offer: "Rent/Buy Movie",
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
];

/* COMMENTED OUT - TO BE ACTIVATED LATER WHEN APPROVED

// High-converting VPN links (no approval needed)
export const vpnAffiliateLinks: AffiliateLink[] = [
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
  }
];

// Streaming services - Apply through respective programs when available
export const streamingAffiliateLinks: AffiliateLink[] = [
  {
    name: "Netflix",
    url: `https://netflix.com/search?q=${encodeURIComponent(movieTitle)}&utm_source=flashmovies&utm_medium=affiliate&utm_campaign=movie_search`,
    bgColor: "bg-[#e50914]",
    hoverColor: "hover:bg-[#f40612]",
    textColor: "text-white",
    offer: "30 Day Free Trial",
    commission: "$40-50 per signup" 
  },
  {
    name: "Hulu",
    url: `https://secure.hulu.com/account/signup?utm_source=flashmovies&utm_medium=affiliate&search=${encodeURIComponent(movieTitle)}`,
    bgColor: "bg-[#1ce783]",
    hoverColor: "hover:bg-[#17d974]",
    textColor: "text-black",
    offer: "$1.99/month",
    commission: "$25-35 per signup"
  },
  {
    name: "Disney+",
    url: `https://www.disneyplus.com/sign-up?cid=DSS-Affiliate-flashmovies&search=${encodeURIComponent(movieTitle)}`,
    bgColor: "bg-[#113ccf]",
    hoverColor: "hover:bg-[#0f35b8]",
    textColor: "text-white",
    offer: "Bundle Available",
    commission: "$20-30 per signup"
  }
];

*/ 