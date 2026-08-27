import { escapeHtml, formatListTitle, mediaDisplayTitle, truncate, yearFromDate } from "./text.js";
import {
  DEFAULT_IMAGE_PATH,
  HOME_BODY,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  assertsSiteCopy,
} from "./copy.js";
import { crawlerMenuSections } from "./menu.js";
import {
  homeFeaturedParagraph,
  homePageDescription,
  listPageDescription,
  listPageParagraphs,
} from "./list-copy.js";
import { tmdbImageUrl } from "./tmdb.js";
import { isBlockedTitle } from "./routes.js";

/**
 * @typedef {object} PageModel
 * @property {number} status
 * @property {string} title
 * @property {string} description
 * @property {string} canonical
 * @property {string} image
 * @property {string} imageAlt
 * @property {string} ogType
 * @property {string} robots
 * @property {string} heading
 * @property {string[]} paragraphs
 * @property {Array<{ href: string, text: string }>} [links]
 * @property {Array<{ title: string, links: Array<{ href: string, text: string }> }>} [navSections]
 * @property {object[]} jsonLd
 * @property {string} [twitterCard]
 * @property {string} [ogImageWidth]
 * @property {string} [ogImageHeight]
 */

function absoluteImage(image, siteOrigin) {
  if (!image) return `${siteOrigin}${DEFAULT_IMAGE_PATH}`;
  if (image.startsWith("http")) return image;
  return `${siteOrigin}${image.startsWith("/") ? image : `/${image}`}`;
}

function imageDimensions(imageUrl) {
  if (imageUrl.includes("image.tmdb.org/t/p/w1280")) {
    return { width: "1280", height: "720" };
  }
  if (imageUrl.includes("image.tmdb.org/t/p/w500")) {
    return { width: "500", height: "750" };
  }
  return { width: "1200", height: "630" };
}

function websiteJsonLd(siteOrigin, description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["FlashMovies", "Flash Movies", "flashmovies.xyz"],
    url: siteOrigin,
    description,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteOrigin,
      description: "Free movies and TV shows online in HD.",
      logo: {
        "@type": "ImageObject",
        url: `${siteOrigin}${DEFAULT_IMAGE_PATH}`,
      },
    },
  };
}

/**
 * @param {object} opts
 */
export function homePage({ canonical, siteOrigin, featuredSections = [] }) {
  const description = homePageDescription();
  const featuredParagraph = homeFeaturedParagraph(featuredSections);
  const paragraphs = featuredParagraph
    ? [...HOME_BODY, featuredParagraph]
    : HOME_BODY;
  return {
    status: 200,
    title: HOME_TITLE,
    description,
    canonical,
    image: `${siteOrigin}${DEFAULT_IMAGE_PATH}`,
    imageAlt: SITE_NAME,
    ogType: "website",
    robots: "index, follow",
    heading: HOME_TITLE,
    paragraphs,
    navSections: featuredSections,
    jsonLd: [websiteJsonLd(siteOrigin, description)],
  };
}

/**
 * @param {object} opts
 */
export function genericPage({
  status = 200,
  title,
  description,
  canonical,
  siteOrigin,
  robots = "index, follow",
  heading,
  paragraphs,
  links = [],
}) {
  const desc = assertsSiteCopy(description);
  return {
    status,
    title,
    description: desc,
    canonical,
    image: `${siteOrigin}${DEFAULT_IMAGE_PATH}`,
    imageAlt: SITE_NAME,
    ogType: "website",
    robots,
    heading: heading || title,
    paragraphs,
    links,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: desc,
        url: canonical,
        isPartOf: websiteJsonLd(siteOrigin, HOME_DESCRIPTION),
      },
    ],
  };
}

function creditNames(credits, job) {
  const crew = credits?.crew || [];
  return crew.filter((c) => c.job === job).map((c) => c.name).filter(Boolean);
}

function castNames(credits, limit = 8) {
  const cast = credits?.cast || [];
  return cast.slice(0, limit).map((c) => c.name).filter(Boolean);
}

/**
 * @param {object} opts
 */
export function detailPage({ route, data, canonical, siteOrigin }) {
  const type = route.type;
  const isWatchPage = route.pathname === "/full-movie";
  const display = mediaDisplayTitle(data);
  const year = yearFromDate(data.release_date || data.first_air_date || data.birthday);
  const titled = year ? `${display} (${year})` : display;
  const overview = (data.overview || data.biography || "").trim();
  const kindLabel = type === "tv" ? "TV series" : type === "person" ? "person" : "movie";

  const description = overview
    ? truncate(
        isWatchPage
          ? `Watch ${titled} free online in HD on Flash Movies. ${overview}`
          : `Watch ${titled} free on Flash Movies. ${overview}`,
        280,
      )
    : isWatchPage
      ? `Watch ${titled} free online in HD on Flash Movies — stream this ${kindLabel} with full play links.`
      : `Watch ${titled} online on Flash Movies — movies and TV in HD.`;

  const poster = tmdbImageUrl(data.poster_path || data.profile_path, "w500");
  const backdrop = tmdbImageUrl(data.backdrop_path, "w1280");
  const image = poster || backdrop || `${siteOrigin}${DEFAULT_IMAGE_PATH}`;

  const genres = (data.genres || []).map((g) => g.name).filter(Boolean);
  const directors = creditNames(data.credits, "Director");
  const actors = castNames(data.credits);

  const paragraphs = [
    overview
      ? truncate(overview, 600)
      : isWatchPage
        ? `Stream ${titled} online on Flash Movies — watch in HD from the full title page.`
        : `${titled} is available to watch online on Flash Movies.`,
    type === "person"
      ? [data.known_for_department && `Known for: ${data.known_for_department}`, data.place_of_birth && `Born: ${data.place_of_birth}`]
          .filter(Boolean)
          .join(". ")
      : [
          genres.length ? `Genres: ${genres.join(", ")}` : "",
          data.vote_average ? `TMDB rating: ${Number(data.vote_average).toFixed(1)}/10` : "",
          !isWatchPage && type !== "person" ? "Watch online in HD on Flash Movies." : "",
        ]
          .filter(Boolean)
          .join(". "),
  ].filter(Boolean);

  const infoUrl = `${siteOrigin}/movie-info?type=${type}&id=${route.id}`;
  const watchUrl = `/full-movie?type=${type}&id=${route.id}`;
  const jsonLd = [];

  if (type === "person") {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Person",
      name: display,
      description: overview ? truncate(overview, 400) : undefined,
      image: image,
      url: canonical,
      birthDate: data.birthday || undefined,
      jobTitle: data.known_for_department || undefined,
    });
  } else {
    const schemaType = type === "tv" ? "TVSeries" : "Movie";
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": schemaType,
      name: display,
      description: overview ? truncate(overview, 400) : undefined,
      image,
      url: canonical,
      datePublished: data.release_date || data.first_air_date || undefined,
      genre: genres.length ? genres : undefined,
      director: directors.map((name) => ({ "@type": "Person", name })),
      actor: actors.map((name) => ({ "@type": "Person", name })),
      aggregateRating:
        data.vote_average && data.vote_count
          ? {
              "@type": "AggregateRating",
              ratingValue: data.vote_average,
              ratingCount: data.vote_count,
              bestRating: 10,
              worstRating: 0,
            }
          : undefined,
      duration: data.runtime ? `PT${data.runtime}M` : undefined,
    });
  }

  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: type === "movie" ? "Movies" : type === "tv" ? "TV Shows" : "People",
        item: `${siteOrigin}/list-items?type=${type}&search=popular&title=popular-${type}s`,
      },
      { "@type": "ListItem", position: 3, name: display, item: infoUrl },
    ],
  });

  const ogType = type === "movie" ? "video.movie" : type === "tv" ? "video.tv_show" : "profile";

  return {
    status: 200,
    title: `${titled} — ${SITE_NAME}`,
    description: assertsSiteCopy(description),
    canonical,
    image,
    imageAlt: titled,
    ogType,
    robots: "index, follow",
    heading: isWatchPage && type !== "person" ? `Watch ${titled} online` : titled,
    paragraphs,
    links: [
      ...(type !== "person"
        ? [
            isWatchPage
              ? { href: `/movie-info?type=${type}&id=${route.id}`, text: `${display} details` }
              : { href: watchUrl, text: `Watch ${display} free online` },
          ]
        : [{ href: infoUrl.replace(siteOrigin, "") || infoUrl, text: `${display} profile` }]),
      { href: "/", text: "Flash Movies — watch movies & TV online" },
    ],
    jsonLd,
  };
}

/**
 * @param {object} opts
 */
export function listPage({ route, data, canonical, siteOrigin }) {
  const listName =
    formatListTitle(route.listTitle) ||
    `${route.type === "tv" ? "TV" : route.type === "person" ? "People" : "Movie"} list`;
  const results = Array.isArray(data?.results)
    ? data.results.filter((item) => !isBlockedTitle(route.type, item.id)).slice(0, 20)
    : [];
  const description = listPageDescription({ route, listName, results });
  const firstImage =
    tmdbImageUrl(results[0]?.poster_path || results[0]?.profile_path, "w500") ||
    `${siteOrigin}${DEFAULT_IMAGE_PATH}`;

  const paragraphs = listPageParagraphs({ route, listName, results });

  const links = results.slice(0, 20).map((item) => ({
    href: `/movie-info?type=${route.type}&id=${item.id}`,
    text: mediaDisplayTitle(item),
  }));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${listName} — ${SITE_NAME}`,
      description,
      url: canonical,
    },
  ];

  if (results.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: listName,
      description,
      url: canonical,
      numberOfItems: results.length,
      itemListElement: results.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: mediaDisplayTitle(item),
        url: `${siteOrigin}/movie-info?type=${route.type}&id=${item.id}`,
      })),
    });
  }

  return {
    status: 200,
    title: `${listName} — ${SITE_NAME}`,
    description,
    canonical,
    image: firstImage,
    imageAlt: listName,
    ogType: "website",
    robots: "index, follow",
    heading: listName,
    paragraphs,
    links,
    jsonLd,
  };
}

export function notFoundPage({ canonical, siteOrigin }) {
  return genericPage({
    status: 404,
    title: `Page not found — ${SITE_NAME}`,
    description: "This page was not found on Flash Movies — browse movies and TV to watch online.",
    canonical,
    siteOrigin,
    robots: "noindex, nofollow",
    heading: "Page not found",
    paragraphs: ["The page you requested is not available on Flash Movies."],
    links: [{ href: "/", text: "Watch movies & TV online — home" }],
  });
}

/**
 * @param {Array<{ title: string, links: Array<{ href: string, text: string }> }>} sections
 */
function renderNavSections(sections) {
  return sections
    .map((section) => {
      const items = section.links
        .map(
          (link) =>
            `          <li><a href="${escapeHtml(link.href)}">${escapeHtml(link.text)}</a></li>`,
        )
        .join("\n");
      return `      <section>\n        <h2>${escapeHtml(section.title)}</h2>\n        <ul>\n${items}\n        </ul>\n      </section>`;
    })
    .join("\n");
}

/**
 * @param {PageModel} page
 * @param {string} siteOrigin
 */
export function renderHtml(page, siteOrigin) {
  const image = absoluteImage(page.image, siteOrigin);
  const dims = imageDimensions(image);
  const jsonLdBlocks = (page.jsonLd || [])
    .map((block) => JSON.parse(JSON.stringify(block)))
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join("\n    ");

  const paragraphs = (page.paragraphs || [])
    .map((p) => `    <p>${escapeHtml(p)}</p>`)
    .join("\n");
  const links = (page.links || [])
    .map((l) => `      <li><a href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a></li>`)
    .join("\n");
  const mainNavSections = page.navSections?.length
    ? `\n    <nav aria-label="Browse Flash Movies">\n${renderNavSections(page.navSections)}\n    </nav>`
    : "";
  const pageLinksNav = links
    ? `\n    <nav aria-label="Related titles">\n      <ul>\n${links}\n      </ul>\n    </nav>`
    : "";
  const siteNav = renderNavSections(crawlerMenuSections());

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="${escapeHtml(page.robots)}">
    <meta name="googlebot" content="${escapeHtml(page.robots)}, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${escapeHtml(page.canonical)}">
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="${escapeHtml(page.ogType)}">
    <meta property="og:url" content="${escapeHtml(page.canonical)}">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.description)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">
    <meta property="og:image:alt" content="${escapeHtml(page.imageAlt || page.title)}">
    <meta property="og:image:width" content="${dims.width}">
    <meta property="og:image:height" content="${dims.height}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@flashmovies">
    <meta name="twitter:creator" content="@flashmovies">
    <meta name="twitter:url" content="${escapeHtml(page.canonical)}">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(page.description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="twitter:image:alt" content="${escapeHtml(page.imageAlt || page.title)}">
    <link rel="icon" type="image/png" href="/flash-movies-logo.png">
    ${jsonLdBlocks}
  </head>
  <body>
    <header>
      <p><a href="/">${escapeHtml(SITE_NAME)}</a></p>
      <h1>${escapeHtml(page.heading)}</h1>
    </header>
    <main>
${paragraphs}${mainNavSections}${pageLinksNav}
    </main>
    <footer>
      <nav aria-label="Site menu">
${siteNav}
      </nav>
    </footer>
  </body>
</html>
`;
}
