import React from "react";
import { useNavigate } from "react-router-dom";
import Meta from "../SEO/meta.tsx";
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Meta 
        title="Page Not Found - Flash Movies"
        description="The page you are looking for does not exist. Discover free movies and TV shows on Flash Movies."
        robots="noindex, follow"
        url={window.location.href}
        keywords={["404", "page not found", "flash movies", "free movies", "streaming"]}
      />
      <div className="flex flex-col items-center justify-center min-h-screen text-white font-roboto bg-[#0a0a0a] px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-[#f5c518] mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you are looking for does not exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-[#f5c518] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#e6b800] transition-colors"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border border-[#f5c518] text-[#f5c518] px-6 py-3 rounded-lg font-semibold hover:bg-[#f5c518] hover:text-black transition-colors"
            >
              Go Back
            </button>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Popular Sections:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => navigate("/list-items?type=movie&search=popular&title=most-popular-movies")}
                className="text-[#f5c518] hover:underline"
              >
                Popular Movies
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => navigate("/list-items?type=tv&search=popular&title=most-popular-shows")}
                className="text-[#f5c518] hover:underline"
              >
                Popular TV Shows
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => navigate("/list-items?type=movie&search=top_rated&title=top-rated-movies")}
                className="text-[#f5c518] hover:underline"
              >
                Top Rated
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound; 