import { HOME_DESCRIPTION, SITE_TAGLINE, assertsSiteCopy } from "./copy.js";
import { formatListTitle, mediaDisplayTitle } from "./text.js";

const GENRE_SLUG_KEYWORDS = {
  "action-movies": "action",
  "adventure-movies": "adventure",
  "animation-movies": "animation",
  "comedy-movies": "comedy",
  "crime-movies": "crime",
  "documentary-movies": "documentary",
  "drama-movies": "drama",
  "family-movies": "family",
  "fantasy-movies": "fantasy",
  "history-movies": "history",
  "horror-movies": "horror",
  "music-movies": "music",
  "mystery-movies": "mystery",
  "romance-movies": "romance",
  "science-fiction-movies": "science fiction",
  "thriller-movies": "thriller",
  "war-movies": "war",
  "western-movies": "western",
  "action-and-adventure-shows": "action and adventure",
  "animation-shows": "animation",
  "comedy-shows": "comedy",
  "crime-shows": "crime",
  "documentary-shows": "documentary",
  "drama-shows": "drama",
  "family-shows": "family",
  "mystery-shows": "mystery",
  "sci-fi-and-fantasy-shows": "sci-fi and fantasy",
  "western-shows": "western",
};

/**
 * @param {string | null | undefined} listTitle
 */
function genreLabelFromTitle(listTitle) {
  if (!listTitle) return "";
  return GENRE_SLUG_KEYWORDS[listTitle] || formatListTitle(listTitle).toLowerCase();
}

/**
 * @param {ParsedRoute["type"]} type
 */
function mediaKind(type) {
  if (type === "tv") return "TV shows";
  if (type === "person") return "actors and celebrities";
  return "movies";
}

/**
 * @param {ParsedRoute["type"]} type
 */
function watchVerb(type) {
  if (type === "person") return "Explore profiles for";
  return "Watch";
}

/**
 * @param {string} listSearch
 * @param {ParsedRoute["type"]} type
 * @param {string} listName
 * @param {ListFilters | undefined} filters
 * @param {string | null | undefined} listTitle
 */
function listContextParagraph(listSearch, type, listName, filters, listTitle) {
  const kind = mediaKind(type);
  const year = new Date().getFullYear();

  if (filters?.withGenres && type !== "person") {
    const label = genreLabelFromTitle(listTitle) || listName.toLowerCase();
    return type === "tv"
      ? `${listName} brings together popular ${label} series you can watch online in HD. Browse episodes and full seasons on Flash Movies — a straightforward way to stream ${label} TV from one catalog page.`
      : `${listName} rounds up ${label} films you can watch online in HD on Flash Movies. Open any title for plot, cast, and a direct path to stream the full movie at flashmovies.xyz.`;
  }

  if (filters?.primaryReleaseYear && type === "movie") {
    return `${filters.primaryReleaseYear} movies on Flash Movies — films released in ${filters.primaryReleaseYear} you can watch online in HD. Browse this year's theatrical and streaming titles from a single list.`;
  }

  if (filters?.firstAirDateYear && type === "tv") {
    return `${filters.firstAirDateYear} TV shows on Flash Movies — series that premiered in ${filters.firstAirDateYear}. Watch episodes online in HD and explore each show's seasons from this list.`;
  }

  if (filters?.voteAverageGte) {
    const band =
      Number(filters.voteAverageGte) >= 8
        ? "highly rated"
        : Number(filters.voteAverageGte) >= 7
          ? "well rated"
          : "solidly rated";
    return `Discover ${band} ${kind.toLowerCase()} worth watching online. This Flash Movies list highlights titles with strong audience scores — stream in HD from curated picks.`;
  }

  const contexts = {
    trending_week:
      type === "person"
        ? `See who is trending this week among popular actors and performers. ${listName} on Flash Movies surfaces names audiences are looking up right now.`
        : `Trending this week on Flash Movies — the ${kind.toLowerCase()} people are watching and talking about right now. Updated from current popularity data so you can stream what's hot in HD.`,
    trending_day:
      `Today's trending ${kind.toLowerCase()} on Flash Movies — fresh picks updated daily. Watch online in HD and catch the titles gaining attention right now.`,
    top_rated:
      `Top rated ${kind.toLowerCase()} to watch online in HD. ${listName} on Flash Movies features critically and audience-loved titles — acclaimed films and series you can stream from one place.`,
    popular:
      type === "person"
        ? `Most popular actors on Flash Movies — explore celebrity profiles, filmographies, and links to related movies and TV you can watch online.`
        : `Most popular ${kind.toLowerCase()} to stream online in HD. ${listName} reflects current viewer demand so you can watch crowd-favorite titles on flashmovies.xyz.`,
    now_playing:
      `Now playing movies you can watch online on Flash Movies. Browse current theatrical and recent releases, read details, and stream in HD from our now playing list.`,
    upcoming:
      `Upcoming movie releases on Flash Movies — preview what's coming soon, read synopses, and save titles to watch online when they're available.`,
    on_the_air:
      `TV series on the air now — watch ongoing shows online on Flash Movies. Stream current seasons and episodes in HD without switching between scattered sources.`,
    airing_today:
      `TV shows airing today — find episodes and series to watch online tonight on Flash Movies. Browse what's on and stream in HD from one catalog.`,
    year_highlights:
      `Best ${year} movies to watch online — ${listName} on Flash Movies highlights standout films from this year with strong ratings and visibility.`,
    discover:
      type === "tv"
        ? `Browse TV shows by genre and mood on Flash Movies. Discover series to watch online in HD — drama, comedy, documentary, sci-fi, and more from a single hub page.`
        : `Browse movies by genre on Flash Movies. Discover films to watch online in HD — action, comedy, horror, romance, sci-fi, and full genre lists in one place.`,
  };

  return contexts[listSearch] || `${listName} on Flash Movies — ${kind.toLowerCase()} you can watch online in HD.`;
}

/**
 * @param {object} opts
 * @param {ParsedRoute} opts.route
 * @param {string} opts.listName
 * @param {object[]} opts.results
 */
export function listPageDescription({ route, listName, results }) {
  const kind = mediaKind(route.type);
  const sample = results
    .slice(0, 5)
    .map((item) => mediaDisplayTitle(item))
    .filter(Boolean)
    .join(", ");
  const base = `Watch ${listName} free online on Flash Movies — stream ${kind.toLowerCase()} in HD with full title pages and play links.`;
  if (!sample) return assertsSiteCopy(base);
  return assertsSiteCopy(`${base} Includes ${sample}.`);
}

/**
 * @param {object} opts
 * @param {ParsedRoute} opts.route
 * @param {string} opts.listName
 * @param {object[]} opts.results
 */
export function listPageParagraphs({ route, listName, results }) {
  const type = route.type;
  const kind = mediaKind(type);
  const verb = watchVerb(type);
  const filters = route.listFilters;
  const titleSample = results
    .slice(0, 12)
    .map((item) => mediaDisplayTitle(item))
    .filter(Boolean);

  const genreFromSlug = route.listTitle ? genreLabelFromTitle(route.listTitle) : "";
  const intro =
    type === "person"
      ? `${listName} on Flash Movies — explore celebrity and actor profiles online. See filmographies, known-for titles, and links to related movies and TV shows you can watch in HD.`
      : `${listName} on Flash Movies — a ${kind.toLowerCase()} list to watch free online in HD. ${verb} popular titles on flashmovies.xyz with full pages for plot, cast, and streaming links.`;

  const context = listContextParagraph(
    route.listSearch || "",
    type,
    listName,
    filters,
    route.listTitle,
  );

  const filterNote =
    filters?.withGenres && genreFromSlug
      ? `Genre focus: ${genreFromSlug}. Use the links below to open a title page, read the synopsis and cast, then watch online on Flash Movies.`
      : filters?.primaryReleaseYear
        ? `Release year: ${filters.primaryReleaseYear}. Each linked title opens a movie page with overview, cast, and streaming options.`
        : filters?.firstAirDateYear
          ? `First air year: ${filters.firstAirDateYear}. Pick a show below for seasons, overview, and watch links.`
          : `Use the links below to open any title — each page includes description, cast where available, and a watch link on Flash Movies.`;

  const sampleParagraph = titleSample.length
    ? `${verb} titles such as ${titleSample.join(", ")}${titleSample.length < results.length ? ", and more" : ""}. Stream these ${kind.toLowerCase()} online in HD on Flash Movies alongside other movies, series, and new releases.`
    : `Browse this ${kind.toLowerCase()} collection on Flash Movies. Titles update from TMDB — watch online in HD across movies, TV series, and latest additions.`;

  const browseParagraph =
    type === "person"
      ? `Flash Movies connects actor pages to the movies and TV shows they appear in. Follow links from a profile into full titles you can watch online — useful when you're searching by cast or exploring a performer's filmography.`
      : `Browse more on Flash Movies: trending lists, top rated picks, genre and year filters, and new releases. This ${kind.toLowerCase()} page is part of a free streaming catalog at flashmovies.xyz — open a title, then watch online in HD.`;

  const closing = `${SITE_TAGLINE} Revisit ${listName} anytime — or return to the Flash Movies home page for trending movies, trending TV, now playing films, and popular actors.`;

  return assertsSiteCopy([intro, context, filterNote, sampleParagraph, browseParagraph, closing]);
}

/**
 * @param {Array<{ title: string, links: Array<{ text: string }> }>} featuredSections
 */
export function homeFeaturedParagraph(featuredSections) {
  if (!featuredSections.length) return "";
  const sectionNames = featuredSections.map((section) => section.title).join(", ");
  const titleNames = featuredSections
    .flatMap((section) => section.links.map((link) => link.text))
    .slice(0, 15)
    .join(", ");
  return assertsSiteCopy(
    `Featured on this page: ${sectionNames}.${titleNames ? ` Watch online in HD, including ${titleNames}.` : ""}`,
  );
}

export function homePageDescription() {
  return assertsSiteCopy(HOME_DESCRIPTION);
}
