interface AffiliateLink {
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
    url: `https://www.amazon.com/dp/B00DBYBNEE?tag=flashmovies0b-20&linkCode=osi&th=1&psc=1`,
    bgColor: "bg-[#00a8e1]",
    hoverColor: "hover:bg-[#0099cc]",
    textColor: "text-white",
    offer: "Start Free Trial",
    commission: "4-8% of all Amazon purchases"
  },
  {
    name: "Aliexpress Movie Merchandise",
    url: `https://s.click.aliexpress.com/e/_c41zVUeT`,
    bgColor: "bg-[#ff1a1a]",
    hoverColor: "hover:bg-[#cc0000]",
    textColor: "text-white",
    offer: "Posters",
    commission: "4-8% commission"
  },
  {
    name: "Movie Merchandise",
    url: `https://www.amazon.com/s?k=${encodeURIComponent(movieTitle)}+movie+merchandise&tag=flashmovies0b-20&ref=sr_nr_n_2`,
    bgColor: "bg-[#ff9900]",
    hoverColor: "hover:bg-[#e68900]",
    textColor: "text-black",
    offer: "Shop Now",
    commission: "4-8% commission"
  },
  {
    name: "Watch on Prime Video",
    url: `https://www.amazon.com/s?k=${encodeURIComponent(movieTitle)}&i=instant-video&tag=flashmovies0b-20&ref=sr_nr_n_1`,
    bgColor: "bg-[#0073e6]",
    hoverColor: "hover:bg-[#005bb5]",
    textColor: "text-white",
    offer: "Rent/Buy Movie",
    commission: "4-8% commission"
  },
  {
    name: "Fire TV Devices",
    url: `https://www.amazon.com/s?k=fire+tv+stick+4k&tag=flashmovies0b-20&ref=sr_nr_n_3`,
    bgColor: "bg-[#232f3e]",
    hoverColor: "hover:bg-[#1a252f]",
    textColor: "text-white",
    offer: "Shop Devices",
    commission: "8-10% commission"
  }
];
