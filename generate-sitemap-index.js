// generate-sitemap-index.js
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemapIndex() {
  console.log('🚀 Starting sitemap index generation...');

  // Create sitemaps directory
  const sitemapsDir = path.resolve(__dirname, 'public', 'sitemaps');
  if (!existsSync(sitemapsDir)) {
    mkdirSync(sitemapsDir, { recursive: true });
  }

  const baseUrl = 'https://flashmovies.xyz';
  const today = new Date().toISOString().split('T')[0];

  // Helper function to create individual sitemap
  const createSitemap = (filename, urls, priority = 0.8, changefreq = 'weekly') => {
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(path.resolve(sitemapsDir, filename));
      let urlCount = 0;

      writeStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
      writeStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

      urls.forEach(url => {
        // Properly encode XML entities - comprehensive encoding
        const encodedUrl = `${baseUrl}${url.path}`
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        
        writeStream.write(`  <url>\n`);
        writeStream.write(`    <loc>${encodedUrl}</loc>\n`);
        writeStream.write(`    <lastmod>${url.lastmod || today}</lastmod>\n`);
        writeStream.write(`    <changefreq>${url.changefreq || changefreq}</changefreq>\n`);
        writeStream.write(`    <priority>${url.priority || priority}</priority>\n`);
        writeStream.write(`  </url>\n`);
        urlCount++;
      });

      writeStream.write('</urlset>\n');
      writeStream.end();

      writeStream.on('finish', () => {
        console.log(`✅ ${filename}: ${urlCount} URLs`);
        resolve({ filename, urlCount });
      });
      writeStream.on('error', reject);
    });
  };

  // 1. Static Pages Sitemap
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' }
  ];

  // 2. Movie Categories Sitemap
  const movieCategories = [
    { path: '/list-items?type=movie&search=top_rated&title=top-rated-movies', priority: 0.9 },
    { path: '/list-items?type=movie&search=popular&title=most-popular-movies', priority: 0.9 },
    { path: '/list-items?type=movie&search=now_playing&title=now-playing-movies', priority: 0.8 },
    { path: '/list-items?type=movie&search=upcoming&title=upcoming-movies', priority: 0.8 },
    { path: '/list-items?type=movie&search=discover&title=browse-movies-by-genre', priority: 0.7 }
  ];

  // 3. TV Categories Sitemap
  const tvCategories = [
    { path: '/list-items?type=tv&search=top_rated&title=top-rated-shows', priority: 0.9 },
    { path: '/list-items?type=tv&search=popular&title=most-popular-shows', priority: 0.9 },
    { path: '/list-items?type=tv&search=airing_today&title=airing-today-shows', priority: 0.8 },
    { path: '/list-items?type=tv&search=on_the_air&title=on-the-air', priority: 0.8 },
    { path: '/list-items?type=tv&search=discover&title=browse-shows-by-genre', priority: 0.7 }
  ];

  // 4. Celebrity Categories
  const celebrityCategories = [
    { path: '/list-items?type=person&search=popular&title=most-popular-actors', priority: 0.8 }
  ];


  // 7. Popular Movie Pages
  const popularMovieIds = [
    // Top rated movies
    550, 155, 13, 122, 680, 27205, 18, 278, 238, 424, 389, 129, 769, 914, 103, 120, 311, 601, 372058,
    299536, 299534, 181808, 284054, 363088, 284053, 100402, 102899, 49026, 1726,
    436270, 338952, 508442, 460465, 419704, 324857, 335983, 862, 557, 489,
    49047, 49051, 49529, 49538, 598, 11216, 11423, 807, 11036,
    244786, 335797,
  ];

  const movieInfoPages = popularMovieIds.map(id => ({
    path: `/movie-info?type=movie&id=${id}`,
    priority: 0.7
  }));

  const movieWatchPages = popularMovieIds.map(id => ({
    path: `/full-movie?type=movie&id=${id}`,
    priority: 0.6
  }));

  // 8. Popular TV Pages
  const popularTvIds = [
    // Top rated TV shows
    1399, 60735, 1396, 456, 62560, 1402, 60059, 85271, 95557, 100088,
    76479, 71712, 82856, 119051, 84958, 94605, 213713, 136315, 246, 1434,
    1418, 1419, 1420, 1421, 1668, 4614, 4629, 46648, 1622, 2316,
    80025, 63174, 69050, 70785, 71033, 81356, 92685, 103768, 115036, 124364,
    1399, 60735, 1396, 456, 62560, 1402, 60059, 85271, 95557, 100088,
    76479, 71712, 82856, 119051, 84958, 94605, 213713, 136315, 246, 1434,
    1418, 1419, 1420, 1421, 1668, 4614, 4629, 46648, 1622, 2316,
    80025, 63174, 69050, 70785, 71033, 81356, 92685, 103768, 115036, 124364
  ];

  const tvInfoPages = popularTvIds.map(id => ({
    path: `/movie-info?type=tv&id=${id}`,
    priority: 0.7
  }));

  const tvWatchPages = popularTvIds.map(id => ({
    path: `/full-movie?type=tv&id=${id}`,
    priority: 0.6
  }));

  // 9. Celebrity/People Pages - Expanded list
  const popularCelebrityIds = [
    // Most popular actors/actresses
    976, 2888, 31, 2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48
  ];

  const celebrityPages = popularCelebrityIds.map(id => ({
    path: `/movie-info?type=person&id=${id}`,
    priority: 0.7
  }));

  // Create individual sitemaps
  const sitemapResults = await Promise.all([
    createSitemap('static.xml', staticPages, 1.0, 'daily'),
    createSitemap('movie-categories.xml', movieCategories, 0.9, 'daily'),
    createSitemap('tv-categories.xml', tvCategories, 0.9, 'daily'),
    createSitemap('celebrity-categories.xml', celebrityCategories, 0.8, 'weekly'),
    createSitemap('celebrities.xml', celebrityPages, 0.7, 'weekly'),
    createSitemap('movie-info.xml', movieInfoPages, 0.7, 'weekly'),
    createSitemap('movie-watch.xml', movieWatchPages, 0.6, 'weekly'),
    createSitemap('tv-info.xml', tvInfoPages, 0.7, 'weekly'),
    createSitemap('tv-watch.xml', tvWatchPages, 0.6, 'weekly')
  ]);

  // Create sitemap index
  const indexStream = createWriteStream(path.resolve(__dirname, 'public', 'sitemap.xml'));
  
  indexStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  indexStream.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

  sitemapResults.forEach(result => {
    indexStream.write('  <sitemap>\n');
    indexStream.write(`    <loc>${baseUrl}/sitemaps/${result.filename}</loc>\n`);
    indexStream.write(`    <lastmod>${today}</lastmod>\n`);
    indexStream.write('  </sitemap>\n');
  });

  indexStream.write('</sitemapindex>\n');
  indexStream.end();

  await new Promise((resolve, reject) => {
    indexStream.on('finish', resolve);
    indexStream.on('error', reject);
  });

  const totalUrls = sitemapResults.reduce((sum, result) => sum + result.urlCount, 0);

  console.log(`\n✅ Sitemap index generated successfully!`);
  console.log(`📊 Total sitemaps: ${sitemapResults.length}`);
  console.log(`📊 Total URLs: ${totalUrls}`);
  console.log(`📁 Main sitemap: public/sitemap.xml`);
  console.log(`📁 Individual sitemaps: public/sitemaps/`);
  console.log(`🌐 Index size: Optimized for search engines\n`);

  // Log individual sitemap sizes
  console.log('📋 Individual sitemap breakdown:');
  sitemapResults.forEach(result => {
    console.log(`   • ${result.filename}: ${result.urlCount} URLs`);
  });
}

generateSitemapIndex().catch(error => {
  console.error('❌ Error generating sitemap index:', error);
}); 