

/**
 * @param {Date} [now]
 */
export function highlightYear(now = new Date()) {
  return now.getFullYear();
}

/**
 * @typedef {{ href: string, text: string }} NavLink
 * @typedef {{ title: string, links: NavLink[] }} NavSection
 */

/**
 * @param {Date} [now]
 * @returns {NavSection[]}
 */
export function crawlerMenuSections(now = new Date()) {
  const year = highlightYear(now);

  return [
    {
      title: "Movies",
      links: [
        {
          href: "/list-items?type=movie&search=trending_week&title=trending-movies-this-week",
          text: "Trending movies this week",
        },
        {
          href: `/list-items?type=movie&search=year_highlights&title=this-years-movie-highlights-${year}`,
          text: `This year's movie highlights (${year})`,
        },
        {
          href: "/list-items?type=movie&search=top_rated&title=top-rated-movies",
          text: "Top rated movies",
        },
        {
          href: "/list-items?type=movie&search=upcoming&title=upcoming-movies",
          text: "Latest releases",
        },
        {
          href: "/list-items?type=movie&search=now_playing&title=now-playing-movies",
          text: "Now playing",
        },
        {
          href: "/list-items?type=movie&search=popular&title=most-popular-movies",
          text: "Most popular movies",
        },
        {
          href: "/list-items?type=movie&search=discover&title=browse-movies-by-genre",
          text: "Browse movies by genre",
        },
        {
          href: "/list-items?type=movie&search=trending_day&title=trending-movies-today",
          text: "Trending movies today",
        },
      ],
    },
    {
      title: "TV shows",
      links: [
        {
          href: "/list-items?type=tv&search=trending_week&title=trending-tv-this-week",
          text: "Trending TV this week",
        },
        {
          href: "/list-items?type=tv&search=top_rated&title=top-rated-shows",
          text: "Top rated shows",
        },
        {
          href: "/list-items?type=tv&search=on_the_air&title=on-the-air",
          text: "On the air",
        },
        {
          href: "/list-items?type=tv&search=popular&title=most-popular-shows",
          text: "Most popular shows",
        },
        {
          href: "/list-items?type=tv&search=airing_today&title=airing-today-shows",
          text: "Airing today",
        },
        {
          href: "/list-items?type=tv&search=discover&title=browse-shows-by-genre",
          text: "Browse shows by genre",
        },
        {
          href: "/list-items?type=tv&search=trending_day&title=trending-tv-today",
          text: "Trending TV today",
        },
      ],
    },
    {
      title: "Celebs",
      links: [
        {
          href: "/list-items?type=person&search=popular&title=most-popular-actors",
          text: "Most popular actors",
        },
      ],
    },
    {
      title: "Site",
      links: [
        { href: "/", text: "Home" },
        {
          href: "/frequently-asked-questions",
          text: "Frequently asked questions",
        },
        { href: "/terms-and-conditions", text: "Terms and conditions" },
      ],
    },
  ];
}

/**
 * @param {NavSection[]} sections
 * @returns {NavLink[]}
 */
export function flattenMenuLinks(sections) {
  return sections.flatMap((section) => section.links);
}

/**
 * List URLs from the menu (for sitemap generation and tests).
 * @param {Date} [now]
 */
export function crawlerMenuListPaths(now = new Date()) {
  return flattenMenuLinks(crawlerMenuSections(now)).filter((link) =>
    link.href.startsWith("/list-items"),
  );
}
