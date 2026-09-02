import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { resolveSitemapCatalogIds } from "./lib/tmdb-ids.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, "../..");
const SITEMAP_URL_LIMIT = 45000;

function loadLocalEnvFile(webRoot = WEB_ROOT) {
  const envPath = path.resolve(webRoot, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/**
 * Delete child sitemap files that are no longer in the index, including leftover
 * movie-watch*.xml / tv-watch*.xml from older generator runs.
 * @param {string} sitemapsDir
 * @param {string[]} keepFilenames
 * @param {(message: string) => void} [log]
 */
export function pruneStaleSitemaps(sitemapsDir, keepFilenames, log = console.log) {
  const keep = new Set(keepFilenames);
  for (const file of readdirSync(sitemapsDir)) {
    if (!file.endsWith(".xml") || keep.has(file)) continue;
    unlinkSync(path.resolve(sitemapsDir, file));
    log(`🗑️  Removed stale sitemap ${file}`);
  }
}

/**
 * @param {object} [options]
 * @param {object} [options.catalog]
 * @param {string} [options.webRoot]
 * @param {(message: string) => void} [options.log]
 */
export async function generateSitemapIndex(options = {}) {
  const log = options.log || console.log;
  log("🚀 Starting sitemap index generation...");
  const webRoot = options.webRoot || WEB_ROOT;
  loadLocalEnvFile(webRoot);

  const catalog = options.catalog || (await resolveSitemapCatalogIds());
  const statsSuffix = catalog.stats
    ? ` | candidates ${catalog.stats.movieCandidates}/${catalog.stats.tvCandidates}/${catalog.stats.personCandidates}`
    : "";
  log(
    `🎬 Catalog ids (${catalog.source}${catalog.exportDate ? ` ${catalog.exportDate}` : ""}): ${catalog.movieIds.length} movies, ${catalog.tvIds.length} TV, ${catalog.personIds.length} people${statsSuffix}`,
  );

  const sitemapsDir = path.resolve(webRoot, "public", "sitemaps");
  if (!existsSync(sitemapsDir)) {
    mkdirSync(sitemapsDir, { recursive: true });
  }

  const baseUrl = "https://flashmovies.xyz";
  const today = new Date().toISOString().split("T")[0];

  const createSitemap = (
    filename,
    urls,
    priority = 0.8,
    changefreq = "weekly"
  ) => {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(
        path.resolve(sitemapsDir, filename)
      );
      let urlCount = 0;

      writeStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
      writeStream.write(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      );

      urls.forEach((url) => {
        const encodedUrl = `${baseUrl}${url.path}`
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        writeStream.write(`  <url>\n`);
        writeStream.write(`    <loc>${encodedUrl}</loc>\n`);
        writeStream.write(`    <lastmod>${url.lastmod || today}</lastmod>\n`);
        writeStream.write(
          `    <changefreq>${url.changefreq || changefreq}</changefreq>\n`
        );
        writeStream.write(
          `    <priority>${url.priority || priority}</priority>\n`
        );
        writeStream.write(`  </url>\n`);
        urlCount++;
      });

      writeStream.write("</urlset>\n");
      writeStream.end();

      writeStream.on("finish", () => {
        log(`✅ ${filename}: ${urlCount} URLs`);
        resolve({ filename, urlCount });
      });
      writeStream.on("error", reject);
    });
  };

  /**
   * Split large url lists into multiple sitemap files (50k URL limit per file).
   * @param {string} baseName
   * @param {object[]} urls
   */
  const createChunkedSitemaps = async (
    baseName,
    urls,
    priority = 0.8,
    changefreq = "weekly",
  ) => {
    if (urls.length <= SITEMAP_URL_LIMIT) {
      return [await createSitemap(`${baseName}.xml`, urls, priority, changefreq)];
    }

    const chunks = [];
    for (let index = 0; index < urls.length; index += SITEMAP_URL_LIMIT) {
      chunks.push(urls.slice(index, index + SITEMAP_URL_LIMIT));
    }

    const results = [];
    for (let index = 0; index < chunks.length; index += 1) {
      const suffix = String(index + 1).padStart(3, "0");
      results.push(
        await createSitemap(`${baseName}-${suffix}.xml`, chunks[index], priority, changefreq),
      );
    }
    return results;
  };

  const highlightYear = new Date().getFullYear();
  const staticPages = [
    { path: "/", priority: 1.0, changefreq: "daily" },
    {
      path: "/frequently-asked-questions",
      priority: 0.6,
      changefreq: "monthly",
    },
    {
      path: "/terms-and-conditions",
      priority: 0.4,
      changefreq: "yearly",
    },
  ];

  const movieCategories = [
    {
      path: "/list-items?type=movie&search=trending_week&title=trending-movies-this-week",
      priority: 0.9,
    },
    {
      path: `/list-items?type=movie&search=year_highlights&title=this-years-movie-highlights-${highlightYear}`,
      priority: 0.9,
    },
    {
      path: "/list-items?type=movie&search=top_rated&title=top-rated-movies",
      priority: 0.9,
    },
    {
      path: "/list-items?type=movie&search=upcoming&title=upcoming-movies",
      priority: 0.8,
    },
    {
      path: "/list-items?type=movie&search=now_playing&title=now-playing-movies",
      priority: 0.8,
    },
    {
      path: "/list-items?type=movie&search=popular&title=most-popular-movies",
      priority: 0.9,
    },
    {
      path: "/list-items?type=movie&search=discover&title=browse-movies-by-genre",
      priority: 0.7,
    },
    {
      path: "/list-items?type=movie&search=trending_day&title=trending-movies-today",
      priority: 0.8,
    },
  ];

  const tvCategories = [
    {
      path: "/list-items?type=tv&search=trending_week&title=trending-tv-this-week",
      priority: 0.9,
    },
    {
      path: "/list-items?type=tv&search=top_rated&title=top-rated-shows",
      priority: 0.9,
    },
    {
      path: "/list-items?type=tv&search=on_the_air&title=on-the-air",
      priority: 0.8,
    },
    {
      path: "/list-items?type=tv&search=popular&title=most-popular-shows",
      priority: 0.9,
    },
    {
      path: "/list-items?type=tv&search=airing_today&title=airing-today-shows",
      priority: 0.8,
    },
    {
      path: "/list-items?type=tv&search=discover&title=browse-shows-by-genre",
      priority: 0.7,
    },
    {
      path: "/list-items?type=tv&search=trending_day&title=trending-tv-today",
      priority: 0.8,
    },
  ];

  const celebrityCategories = [
    {
      path: "/list-items?type=person&search=popular&title=most-popular-actors",
      priority: 0.8,
    },
  ];

  const popularMovieIds = catalog.movieIds;
  const popularTvIds = catalog.tvIds;
  const popularCelebrityIds = catalog.personIds;

  const movieInfoPages = popularMovieIds.map((id) => ({
    path: `/movie-info?type=movie&id=${id}`,
    priority: 0.7,
  }));

  const tvInfoPages = popularTvIds.map((id) => ({
    path: `/movie-info?type=tv&id=${id}`,
    priority: 0.7,
  }));

  const celebrityPages = popularCelebrityIds.map((id) => ({
    path: `/movie-info?type=person&id=${id}`,
    priority: 0.7,
  }));

  const movieGenres = [
    [28, "action-movies"],
    [12, "adventure-movies"],
    [16, "animation-movies"],
    [35, "comedy-movies"],
    [80, "crime-movies"],
    [99, "documentary-movies"],
    [18, "drama-movies"],
    [10751, "family-movies"],
    [14, "fantasy-movies"],
    [36, "history-movies"],
    [27, "horror-movies"],
    [10402, "music-movies"],
    [9648, "mystery-movies"],
    [10749, "romance-movies"],
    [878, "science-fiction-movies"],
    [53, "thriller-movies"],
    [10752, "war-movies"],
    [37, "western-movies"],
  ].map(([id, title]) => ({
    path: `/list-items?type=movie&search=discover&with_genres=${id}&title=${title}`,
    priority: 0.6,
  }));

  const tvGenres = [
    [10759, "action-and-adventure-shows"],
    [16, "animation-shows"],
    [35, "comedy-shows"],
    [80, "crime-shows"],
    [99, "documentary-shows"],
    [18, "drama-shows"],
    [10751, "family-shows"],
    [9648, "mystery-shows"],
    [10765, "sci-fi-and-fantasy-shows"],
    [37, "western-shows"],
  ].map(([id, title]) => ({
    path: `/list-items?type=tv&search=discover&with_genres=${id}&title=${title}`,
    priority: 0.6,
  }));

  const yearBasedPages = [];
  for (let year = highlightYear; year >= 2015; year -= 1) {
    yearBasedPages.push({
      path: `/list-items?type=movie&search=discover&primary_release_year=${year}&title=${year}-movies`,
      priority: 0.5,
    });
    yearBasedPages.push({
      path: `/list-items?type=tv&search=discover&first_air_date_year=${year}&title=${year}-tv-shows`,
      priority: 0.5,
    });
  }

  const ratingBands = [
    ["8", "10", "highly-rated"],
    ["7", "8", "good-rated"],
    ["6", "7", "decent-rated"],
  ];
  const ratingBasedPages = ratingBands.flatMap(([gte, lte, label]) => [
    {
      path: `/list-items?type=movie&search=discover&vote_average.gte=${gte}&vote_average.lte=${lte}&title=${label}-movies`,
      priority: 0.4,
    },
    {
      path: `/list-items?type=tv&search=discover&vote_average.gte=${gte}&vote_average.lte=${lte}&title=${label}-tv-shows`,
      priority: 0.4,
    },
  ]);

  const sitemapGroups = await Promise.all([
    createSitemap("static.xml", staticPages, 1.0, "daily"),
    createSitemap("movie-categories.xml", movieCategories, 0.9, "daily"),
    createSitemap("tv-categories.xml", tvCategories, 0.9, "daily"),
    createSitemap(
      "celebrity-categories.xml",
      celebrityCategories,
      0.8,
      "weekly",
    ),
    createSitemap("movie-genres.xml", movieGenres, 0.6, "weekly"),
    createSitemap("tv-genres.xml", tvGenres, 0.6, "weekly"),
    createSitemap("year-based.xml", yearBasedPages, 0.5, "monthly"),
    createSitemap("rating-based.xml", ratingBasedPages, 0.4, "monthly"),
    createChunkedSitemaps("celebrities", celebrityPages, 0.7, "weekly"),
    createChunkedSitemaps("movie-info", movieInfoPages, 0.7, "weekly"),
    createChunkedSitemaps("tv-info", tvInfoPages, 0.7, "weekly"),
  ]);

  const sitemapResults = sitemapGroups.flat();
  pruneStaleSitemaps(sitemapsDir, sitemapResults.map((result) => result.filename), log);

  const indexStream = createWriteStream(
    path.resolve(webRoot, "public", "sitemap.xml")
  );

  indexStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  indexStream.write(
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  );

  sitemapResults.forEach((result) => {
    indexStream.write("  <sitemap>\n");
    indexStream.write(
      `    <loc>${baseUrl}/sitemaps/${result.filename}</loc>\n`
    );
    indexStream.write(`    <lastmod>${today}</lastmod>\n`);
    indexStream.write("  </sitemap>\n");
  });

  indexStream.write("</sitemapindex>\n");
  indexStream.end();

  await new Promise((resolve, reject) => {
    indexStream.on("finish", resolve);
    indexStream.on("error", reject);
  });

  const totalUrls = sitemapResults.reduce(
    (sum, result) => sum + result.urlCount,
    0
  );

  log(`\n✅ Sitemap index generated successfully!`);
  log(`📊 Total sitemaps: ${sitemapResults.length}`);
  log(`📊 Total URLs: ${totalUrls}`);
  log(`📁 Main sitemap: public/sitemap.xml`);
  log(`📁 Individual sitemaps: public/sitemaps/`);
  log(`🌐 Index size: Optimized for search engines\n`);

  log("📋 Individual sitemap breakdown:");
  sitemapResults.forEach((result) => {
    log(`   • ${result.filename}: ${result.urlCount} URLs`);
  });

  return { sitemapResults, totalUrls };
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(path.resolve(entry)).href === import.meta.url;
}

if (isMainModule()) {
  generateSitemapIndex().catch((error) => {
    console.error("❌ Error generating sitemap index:", error);
    process.exitCode = 1;
  });
}
