// generate-sitemap-index.js
import { createWriteStream, mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemapIndex() {
  console.log("🚀 Starting sitemap index generation...");

  // Create sitemaps directory
  const sitemapsDir = path.resolve(__dirname, "public", "sitemaps");
  if (!existsSync(sitemapsDir)) {
    mkdirSync(sitemapsDir, { recursive: true });
  }

  const baseUrl = "https://flashmovies.xyz";
  const today = new Date().toISOString().split("T")[0];

  // Helper function to create individual sitemap
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
        // Properly encode XML entities - comprehensive encoding
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
        console.log(`✅ ${filename}: ${urlCount} URLs`);
        resolve({ filename, urlCount });
      });
      writeStream.on("error", reject);
    });
  };

  // 1. Static Pages Sitemap
  const staticPages = [{ path: "/", priority: 1.0, changefreq: "daily" }];

  // 2. Movie Categories Sitemap
  const movieCategories = [
    {
      path: "/list-items?type=movie&search=top_rated&title=top-rated-movies",
      priority: 0.9,
    },
    {
      path: "/list-items?type=movie&search=popular&title=most-popular-movies",
      priority: 0.9,
    },
    {
      path: "/list-items?type=movie&search=now_playing&title=now-playing-movies",
      priority: 0.8,
    },
    {
      path: "/list-items?type=movie&search=upcoming&title=upcoming-movies",
      priority: 0.8,
    },
    {
      path: "/list-items?type=movie&search=discover&title=browse-movies-by-genre",
      priority: 0.7,
    },
  ];

  // 3. TV Categories Sitemap
  const tvCategories = [
    {
      path: "/list-items?type=tv&search=top_rated&title=top-rated-shows",
      priority: 0.9,
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
      path: "/list-items?type=tv&search=on_the_air&title=on-the-air",
      priority: 0.8,
    },
    {
      path: "/list-items?type=tv&search=discover&title=browse-shows-by-genre",
      priority: 0.7,
    },
  ];

  // 4. Celebrity Categories
  const celebrityCategories = [
    {
      path: "/list-items?type=person&search=popular&title=most-popular-actors",
      priority: 0.8,
    },
  ];

  // 7. Popular Movie Pages
  const popularMovieIds = [
    //top rated 50
    278, 238, 240, 424, 389, 129, 155, 19404, 497, 496243, 122, 680, 372058, 13,
    429, 157336, 346, 769, 12477, 637, 550, 11216, 667257, 14537, 598, 40096,
    120, 539, 803796, 510, 696374, 311, 121, 324857, 255709, 4935, 1891, 704264,
    378064, 770156, 423, 724089, 244786, 807, 761053, 27205, 1058694, 12493,
    567, 274,
    //popular 50
    755898, 1234821, 1195631, 1241470, 1185528, 1106289, 1087192, 1311031,
    1319895, 1285247, 1155281, 1078605, 986206, 980477, 1071585, 552524,
    1307078, 1061474, 617126, 1225572, 1011477, 1100988, 803796, 1119878,
    1339166, 936108, 541671, 1393382, 1263256, 574475, 7451, 1124619, 812455,
    715253, 648878, 1188423, 1181540, 986056, 13499, 1125257, 575265, 1452176,
    1365103, 1280461, 1315986, 911430, 1175942, 1374534, 1403735, 715287,
  ];

  const movieInfoPages = popularMovieIds.map((id) => ({
    path: `/movie-info?type=movie&id=${id}`,
    priority: 0.7,
  }));

  const movieWatchPages = popularMovieIds.map((id) => ({
    path: `/full-movie?type=movie&id=${id}`,
    priority: 0.6,
  }));

  // 8. Popular TV Pages
  const popularTvIds = [
    //top rated 40
    1396, 94605, 219246, 209867, 246, 37854, 131378, 220542, 31911, 94954,
    60059, 60625, 87108, 92685, 1429, 46298, 85077, 70785, 42705, 1398, 85937,
    240411, 42573, 62741, 72637, 95557, 13916, 95269, 65930, 89456, 31132,
    80040, 57706, 77696, 1430, 127532, 60863, 100, 259666, 82728,
    //popular 40
    119051, 157239, 121876, 79744, 194766, 2734, 93405, 1416, 1405, 1622,
    227114, 256911, 1399, 196890, 244808, 1434, 4614, 2288, 292035, 549, 4057,
    207484, 456, 1396, 34307, 764, 1408, 240411, 279060, 207468, 1431, 65334,
    60625, 46952, 60585, 1402, 66732, 44217, 18165, 2224,
  ];

  const tvInfoPages = popularTvIds.map((id) => ({
    path: `/movie-info?type=tv&id=${id}`,
    priority: 0.7,
  }));

  const tvWatchPages = popularTvIds.map((id) => ({
    path: `/full-movie?type=tv&id=${id}`,
    priority: 0.6,
  }));

  // 9. Celebrity/People Pages - Expanded list
  const popularCelebrityIds = [
    2231916, 974169, 53, 1253360, 18897, 976, 2604515, 1892, 1325949, 33022,
    1836114, 11701, 1222077, 4095744, 1879666, 115440, 1466, 1903006, 64, 29523,
    934159, 4783, 556356, 936970, 3371804, 568141, 31, 3455931, 91671, 6886,
    572043, 1397778, 8783, 2189618, 3486663, 7497, 6161, 88029, 1812, 1356210,
    11678, 30613, 27740, 77335, 14984, 1253353, 21089, 18352, 4886, 10882, 4174,
    15286, 9273, 15831, 4764, 3092, 6677, 66896, 1590797, 17605, 3136, 1030513,
    8874, 9807, 23680, 57027, 11702, 202032, 51875, 2963, 418, 1772, 59254, 501,
    4095689, 8785, 1920, 3392, 3489, 221773,
  ];

  const celebrityPages = popularCelebrityIds.map((id) => ({
    path: `/movie-info?type=person&id=${id}`,
    priority: 0.7,
  }));

  // Create individual sitemaps
  const sitemapResults = await Promise.all([
    createSitemap("static.xml", staticPages, 1.0, "daily"),
    createSitemap("movie-categories.xml", movieCategories, 0.9, "daily"),
    createSitemap("tv-categories.xml", tvCategories, 0.9, "daily"),
    createSitemap(
      "celebrity-categories.xml",
      celebrityCategories,
      0.8,
      "weekly"
    ),
    createSitemap("celebrities.xml", celebrityPages, 0.7, "weekly"),
    createSitemap("movie-info.xml", movieInfoPages, 0.7, "weekly"),
    createSitemap("movie-watch.xml", movieWatchPages, 0.6, "weekly"),
    createSitemap("tv-info.xml", tvInfoPages, 0.7, "weekly"),
    createSitemap("tv-watch.xml", tvWatchPages, 0.6, "weekly"),
  ]);

  // Create sitemap index
  const indexStream = createWriteStream(
    path.resolve(__dirname, "public", "sitemap.xml")
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

  console.log(`\n✅ Sitemap index generated successfully!`);
  console.log(`📊 Total sitemaps: ${sitemapResults.length}`);
  console.log(`📊 Total URLs: ${totalUrls}`);
  console.log(`📁 Main sitemap: public/sitemap.xml`);
  console.log(`📁 Individual sitemaps: public/sitemaps/`);
  console.log(`🌐 Index size: Optimized for search engines\n`);

  // Log individual sitemap sizes
  console.log("📋 Individual sitemap breakdown:");
  sitemapResults.forEach((result) => {
    console.log(`   • ${result.filename}: ${result.urlCount} URLs`);
  });
}

generateSitemapIndex().catch((error) => {
  console.error("❌ Error generating sitemap index:", error);
});
