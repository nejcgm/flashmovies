import { escapeHtml, formatListTitle, mediaDisplayTitle, truncate, yearFromDate } from "./text.js";
import {
  DEFAULT_IMAGE_PATH,
  HOME_BODY,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  assertsCatalogCopy,
} from "./copy.js";
import { tmdbImageUrl } from "./tmdb.js";

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
export function homePage({ canonical, siteOrigin }) {
  const description = assertsCatalogCopy(HOME_DESCRIPTION);
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
    paragraphs: HOME_BODY,
    links: [
      { href: "/list-items?type=movie&search=popular&title=popular-movies", text: "Popular movies" },
      { href: "/list-items?type=tv&search=popular&title=popular-tv-shows", text: "Popular TV shows" },
      { href: "/list-items?type=person&search=popular&title=most-popular-actors", text: "Popular people" },
    ],
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
  const desc = assertsCatalogCopy(description);
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
  const display = mediaDisplayTitle(data);
  const year = yearFromDate(data.release_date || data.first_air_date || data.birthday);
  const titled = year ? `${display} (${year})` : display;
  const overview = (data.overview || data.biography || "").trim();
  const kindLabel = type === "tv" ? "TV series" : type === "person" ? "person" : "movie";

  const description = overview
    ? truncate(`${overview} ${titled} in the Flash Movies ${kindLabel} catalog.`, 280)
    : `${titled} — details and catalog information on Flash Movies, a movie and TV discovery catalog.`;

  const poster = tmdbImageUrl(data.poster_path || data.profile_path, "w500");
  const backdrop = tmdbImageUrl(data.backdrop_path, "w1280");
  const image = poster || backdrop || `${siteOrigin}${DEFAULT_IMAGE_PATH}`;

  const genres = (data.genres || []).map((g) => g.name).filter(Boolean);
  const directors = creditNames(data.credits, "Director");
  const actors = castNames(data.credits);

  const paragraphs = [
    overview ? truncate(overview, 600) : `${titled} is listed in the Flash Movies catalog.`,
    type === "person"
      ? [data.known_for_department && `Known for: ${data.known_for_department}`, data.place_of_birth && `Born: ${data.place_of_birth}`]
          .filter(Boolean)
          .join(". ")
      : [
          genres.length ? `Genres: ${genres.join(", ")}` : "",
          data.vote_average ? `TMDB rating: ${Number(data.vote_average).toFixed(1)}/10` : "",
        ]
          .filter(Boolean)
          .join(". "),
  ].filter(Boolean);

  const infoUrl = `${siteOrigin}/movie-info?type=${type}&id=${route.id}`;
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
    description: assertsCatalogCopy(description),
    canonical,
    image,
    imageAlt: titled,
    ogType,
    robots: "index, follow",
    heading: titled,
    paragraphs,
    links: [
      { href: infoUrl.replace(siteOrigin, "") || infoUrl, text: `${display} catalog page` },
      { href: "/", text: "Flash Movies home" },
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
    `${route.type === "tv" ? "TV" : route.type === "person" ? "People" : "Movie"} catalog`;
  const description = assertsCatalogCopy(
    `Browse ${listName} in the Flash Movies catalog of movies, TV shows, and people.`,
  );
  const results = Array.isArray(data?.results) ? data.results.slice(0, 20) : [];
  const firstImage =
    tmdbImageUrl(results[0]?.poster_path || results[0]?.profile_path, "w500") ||
    `${siteOrigin}${DEFAULT_IMAGE_PATH}`;

  const paragraphs = [
    `${listName} on Flash Movies, a movie and TV discovery catalog.`,
    results.length
      ? `Titles in this list include ${results
          .slice(0, 8)
          .map((item) => mediaDisplayTitle(item))
          .join(", ")}.`
      : "",
  ].filter(Boolean);

  const links = results.slice(0, 12).map((item) => ({
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
    description: "This page is not in the Flash Movies movie and TV catalog.",
    canonical,
    siteOrigin,
    robots: "noindex, nofollow",
    heading: "Page not found",
    paragraphs: ["The requested page does not exist in the Flash Movies catalog."],
    links: [{ href: "/", text: "Back to Flash Movies" }],
  });
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
${paragraphs}
${links ? `    <nav>\n      <ul>\n${links}\n      </ul>\n    </nav>` : ""}
    </main>
  </body>
</html>
`;
}
