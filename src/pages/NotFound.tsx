import React from 'react';
import { Link } from 'react-router-dom';
import Meta from '../SEO/meta';

const NotFound: React.FC = () => {
  return (
    <>
      <Meta 
        title="404 - Page Not Found | Flash Movies"
        description="Sorry, the page you're looking for doesn't exist. Browse our collection of free movies and TV shows on Flash Movies."
        robots="noindex, nofollow"
        url={window.location.href}
        keywords={['404', 'page not found', 'flash movies', 'movies', 'tv shows']}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
        <div className="text-center max-w-md">
          <div className="text-[120px] sm:text-[180px] font-bold text-[#f5c518] leading-none">
            404
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Sorry, the page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="inline-block bg-[#f5c518] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#e6b800] transition-colors"
            >
              Go to Homepage
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
              <Link 
                to="/list-items?type=movie&search=popular&title=popular-movies" 
                className="text-[#f5c518] hover:text-[#e6b800] underline"
              >
                Browse Movies
              </Link>
              <Link 
                to="/list-items?type=tv&search=popular&title=popular-tv-shows" 
                className="text-[#f5c518] hover:text-[#e6b800] underline"
              >
                Browse TV Shows
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 404 Error Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "404 Error - Page Not Found",
          "description": "The requested page could not be found on Flash Movies.",
          "url": window.location.href,
          "mainEntity": {
            "@type": "Thing",
            "name": "404 Error",
            "description": "Page not found error"
          }
        })}
      </script>
    </>
  );
};

export default NotFound; 