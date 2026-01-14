import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_BEARER = ""
const BASE_URL = 'https://api.themoviedb.org/3';
const fetchItems = 50; 

async function fetchPopularCelebrities() {
  try {
    if (!TMDB_BEARER) throw new Error('TMDB API Bearer token missing');

    const celebrities = [];
    let page = 1;

    while (celebrities.length < fetchItems && page <= 5) {
      const response = await axios.get(`${BASE_URL}/movie/popular?language=en-US&page=${page}`, {
        headers: { Authorization: TMDB_BEARER }
      });

      celebrities.push(...(response.data.results || []));
      page++;
      await new Promise(r => setTimeout(r, 200));
    }

    const top80 = celebrities.slice(0, fetchItems).map(c => ({
      id: c.id,
      name: c.name,
      known_for: c.known_for_department,
      popularity: c.popularity
    }));

    console.log('Top 80 celebrities:');
    top80.forEach((c, i) => console.log(`${i+1}. ${c.name} (ID: ${c.id})`));

    console.log('\nAll IDs:', top80.map(c => c.id).join(', '));
    return top80.map(c => c.id);

  } catch (e) {
    console.error('Error:', e.message);
    return [];
  }
}

fetchPopularCelebrities();
