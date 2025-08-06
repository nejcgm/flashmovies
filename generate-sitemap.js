// generate-sitemap.js
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('🚀 Starting sitemap generation...');

  const writeStream = createWriteStream(path.resolve(__dirname, 'public', 'sitemap.xml'));
  
  // Add stats counter
  let urlCount = 0;

  // Helper function to add URL with proper formatting
  const addUrl = (url, changefreq, priority, lastmod = null) => {
    const formattedDate = lastmod || new Date().toISOString().split('T')[0];
    // Properly encode XML entities
    const encodedUrl = url.replace(/&/g, '&amp;');
    writeStream.write(`  <url>\n`);
    writeStream.write(`    <loc>https://flashmovies.xyz${encodedUrl}</loc>\n`);
    writeStream.write(`    <lastmod>${formattedDate}</lastmod>\n`);
    writeStream.write(`    <changefreq>${changefreq}</changefreq>\n`);
    writeStream.write(`    <priority>${priority}</priority>\n`);
    writeStream.write(`  </url>\n`);
    urlCount++;
  };

  // Write XML header
  writeStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  writeStream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

  // 1. Homepage - Highest Priority
  console.log('🏠 Adding homepage...');
  addUrl('/', 'daily', 1.0);

  // 2. Movie Categories - High Priority
  console.log('🎬 Adding movie categories...');
  const movieCategories = [
    { path: '/list-items?type=movie&search=top_rated&title=top-rated-movies', priority: 0.9, name: 'Top Rated Movies' },
    { path: '/list-items?type=movie&search=popular&title=most-popular-movies', priority: 0.9, name: 'Popular Movies' },
    { path: '/list-items?type=movie&search=now_playing&title=now-playing-movies', priority: 0.8, name: 'Now Playing' },
    { path: '/list-items?type=movie&search=upcoming&title=upcoming-movies', priority: 0.8, name: 'Upcoming Movies' },
    { path: '/list-items?type=movie&search=discover&title=browse-movies-by-genre', priority: 0.7, name: 'Browse by Genre' }
  ];

  movieCategories.forEach(category => {
    addUrl(category.path, 'daily', category.priority);
  });

  // 3. TV Show Categories - High Priority
  console.log('📺 Adding TV show categories...');
  const tvCategories = [
    { path: '/list-items?type=tv&search=top_rated&title=top-rated-shows', priority: 0.9, name: 'Top Rated Shows' },
    { path: '/list-items?type=tv&search=popular&title=most-popular-shows', priority: 0.9, name: 'Popular Shows' },
    { path: '/list-items?type=tv&search=airing_today&title=airing-today-shows', priority: 0.8, name: 'Airing Today' },
    { path: '/list-items?type=tv&search=on_the_air&title=on-the-air', priority: 0.8, name: 'On The Air' },
    { path: '/list-items?type=tv&search=discover&title=browse-shows-by-genre', priority: 0.7, name: 'Browse Shows by Genre' }
  ];

  tvCategories.forEach(category => {
    addUrl(category.path, 'daily', category.priority);
  });

  // 3.5. Celebrity/People Categories
  console.log('🌟 Adding celebrity pages...');
  const celebrityCategories = [
    { path: '/list-items?type=person&search=popular&title=most-popular-actors', priority: 0.8, name: 'Most Popular Actors' },
    { path: '/list-items?type=person&title=celebrities', priority: 0.7, name: 'All Celebrities' }
  ];

  celebrityCategories.forEach(category => {
    addUrl(category.path, 'weekly', category.priority);
  });

  // 4. Genre-specific pages for Movies
  console.log('🎭 Adding movie genre pages...');
  const movieGenres = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' }, { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];

  movieGenres.forEach(genre => {
    const genreName = genre.name.toLowerCase().replace(/\s+/g, '-');
    addUrl(`/list-items?type=movie&search=discover&with_genres=${genre.id}&title=${genreName}-movies`, 'weekly', 0.6);
  });

  // 5. Genre-specific pages for TV Shows
  console.log('📻 Adding TV show genre pages...');
  const tvGenres = [
    { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' }, { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' }, { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' }, { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' }
  ];

  tvGenres.forEach(genre => {
    const genreName = genre.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    addUrl(`/list-items?type=tv&search=discover&with_genres=${genre.id}&title=${genreName}-shows`, 'weekly', 0.6);
  });

  // 6. Popular Movie Pages - Current trending and classic movies
  console.log('🌟 Adding popular movie pages...');
  const popularMovieIds = [
    // Recent blockbusters and classics
    550, 155, 13, 122, 680, 27205, 18, 278, 238, 424, 389, 129, 769, 914, 103, 120, 311, 601, 372058,
    // Marvel/DC movies
    299536, 299534, 181808, 284054, 363088, 284053, 100402, 102899, 49026, 1726,
    // Popular recent releases
    436270, 338952, 508442, 460465, 419704, 324857, 335983, 862, 557, 489, 
    // Classic movies
    49047, 49051, 49529, 49538, 598, 11216, 11423, 807, 11036
  ];

  popularMovieIds.forEach(id => {
    addUrl(`/movie-info?type=movie&id=${id}`, 'weekly', 0.7);
    addUrl(`/full-movie?type=movie&id=${id}`, 'weekly', 0.6);
  });

  // 7. Popular TV Show Pages
  console.log('📺 Adding popular TV show pages...');
  const popularTvIds = [
    // Current popular shows
    1399, 60735, 1396, 456, 62560, 1402, 60059, 85271, 95557, 100088,
    76479, 71712, 82856, 119051, 84958, 94605, 213713, 136315, 246, 1434,
    // Classic shows
    1418, 1419, 1420, 1421, 1668, 4614, 4629, 46648, 1622, 2316,
    // Netflix/Streaming hits
    80025, 63174, 69050, 70785, 71033, 81356, 92685, 103768, 115036, 124364
  ];

  popularTvIds.forEach(id => {
    addUrl(`/movie-info?type=tv&id=${id}`, 'weekly', 0.7);
    addUrl(`/full-movie?type=tv&id=${id}`, 'weekly', 0.6);
  });

  // 8. Year-specific pages
  console.log('📅 Adding year-specific pages...');
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 10; year--) {
    addUrl(`/list-items?type=movie&search=discover&primary_release_year=${year}&title=${year}-movies`, 'monthly', 0.5);
    addUrl(`/list-items?type=tv&search=discover&first_air_date_year=${year}&title=${year}-tv-shows`, 'monthly', 0.5);
  }

  // 9. Rating-based pages
  console.log('⭐ Adding rating-based pages...');
  const ratingRanges = [
    { min: 8, max: 10, title: 'highly-rated' },
    { min: 7, max: 8, title: 'good-rated' },
    { min: 6, max: 7, title: 'decent-rated' }
  ];

  ratingRanges.forEach(range => {
    addUrl(`/list-items?type=movie&search=discover&vote_average.gte=${range.min}&vote_average.lte=${range.max}&title=${range.title}-movies`, 'monthly', 0.4);
    addUrl(`/list-items?type=tv&search=discover&vote_average.gte=${range.min}&vote_average.lte=${range.max}&title=${range.title}-tv-shows`, 'monthly', 0.4);
  });

  // Close XML
  writeStream.write('</urlset>\n');
  writeStream.end();

  // Wait for write to complete
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📊 Total URLs: ${urlCount}`);
  console.log(`📁 File saved to: public/sitemap.xml`);
  console.log(`🌐 Size: ${(await import('fs')).statSync(path.resolve(__dirname, 'public', 'sitemap.xml')).size} bytes`);
}

generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
});
