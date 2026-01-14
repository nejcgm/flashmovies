import React from "react";
import { Helmet } from "react-helmet-async";

interface MovieSchemaProps {
  title: string;
  description?: string;
  image?: string;
  releaseDate?: string;
  genre?: string[];
  director?: string[];
  actor?: string[];
  rating?: number;
  ratingCount?: number;
  duration?: number;
  type: "movie" | "tv";
  url: string;
}

const MovieSchema: React.FC<MovieSchemaProps> = ({
  title,
  description,
  image,
  releaseDate,
  genre = [],
  director = [],
  actor = [],
  rating,
  ratingCount,
  duration,
  type,
  url,
}) => {
  const schemaType = type === "movie" ? "Movie" : "TVSeries";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": title,
    "description": description,
    "image": image ? `https://image.tmdb.org/t/p/w500${image}` : undefined,
    "url": url,
    "datePublished": releaseDate,
    "genre": genre,
    "director": director.map(name => ({
      "@type": "Person",
      "name": name
    })),
    "actor": actor.map(name => ({
      "@type": "Person", 
      "name": name
    })),
    "aggregateRating": rating && ratingCount ? {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "ratingCount": ratingCount,
      "bestRating": 10,
      "worstRating": 0
    } : undefined,
    "duration": duration ? `PT${duration}M` : undefined,
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": url.replace("/movie-info", "/full-movie"),
        "inLanguage": "en",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    },
    "provider": {
      "@type": "Organization",
      "name": "Flash Movies",
      "url": "https://flashmovies.xyz"
    }
  };

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(cleanSchema)}
      </script>
    </Helmet>
  );
};

export default MovieSchema; 