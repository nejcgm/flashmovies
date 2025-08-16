import React from "react";
import { Helmet } from "react-helmet";

interface IMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  image?: string;
  robots?: string;
  charset?: string;
  favicon?: string;
  type?: "website" | "video.movie" | "video.tv_show" | "article";
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const Meta = ({
  title = "Flash Movies - Free Movie Streaming",
  description = "Watch free movies and TV shows online on Flash Movies. Stream the latest movies and popular TV series in HD for free, anytime and anywhere.",
  keywords = [
    "flash movies",
    "flashmovies",
    "flashmovies.xyz",
    "flash movie",
    "flash",
    "free movies",
    "movie streaming", 
    "watch movies online",
    "flash movies",
    "watch tv shows online",
    "free tv shows",
    "stream movies free",
    "online movie platform",
    "HD movies",
    "TV series streaming"
  ],
  url = "https://flashmovies.xyz",
  image = "https://flashmovies.xyz/flash-movies-logo.png",
  robots = "index, follow",
  charset = "UTF-8",
  favicon = "/flash-movies-logo.png",
  type = "website",
  siteName = "Flash Movies",
  author = "Flash Movies",
  publishedTime,
  modifiedTime,
}: IMetaProps) => {
  // Ensure image URL is absolute
  const absoluteImageUrl = image?.startsWith('http') 
    ? image 
    : image?.startsWith('/') 
      ? `https://flashmovies.xyz${image}`
      : `https://flashmovies.xyz/${image}`;

  // Set appropriate image dimensions based on image source
  const getImageDimensions = (imageUrl: string) => {
    if (imageUrl.includes('image.tmdb.org/t/p/w1280')) {
      return { width: "1280", height: "720" }; // 16:9 ratio for backdrops
    }
    if (imageUrl.includes('image.tmdb.org/t/p/w500')) {
      return { width: "500", height: "750" }; // 2:3 ratio for posters
    }
    // Default Flash Movies logo dimensions
    return { width: "1200", height: "630" }; // 1.91:1 ratio recommended by Facebook
  };

  const imageDimensions = getImageDimensions(absoluteImageUrl);

  return (
    <Helmet>
      {/* Basic tags */}
      <meta charSet={charset} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="robots" content={robots} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Theme and mobile optimization */}
      <meta name="theme-color" content="#000000" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Favicon and icons */}
      <link rel="icon" href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />
      <link rel="shortcut icon" href={favicon} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content={imageDimensions.width} />
      <meta property="og:image:height" content={imageDimensions.height} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@flashmovies" />
      <meta name="twitter:creator" content="@flashmovies" />

      {/* Additional SEO tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="referrer" content="origin-when-cross-origin" />

      {/* Structured Data for Movie/TV Site */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "alternateName": ["FlashMovies", "Flash Movies", "flashmovies.xyz"],
          "url": url,
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${url}/list-items?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            // Add your social media URLs here when available
            // "https://twitter.com/flashmovies",
            // "https://facebook.com/flashmovies"
          ],
          "mainEntity": {
            "@type": "Organization",
            "name": siteName,
            "alternateName": ["FlashMovies", "Flash Movies"],
            "url": url,
            "logo": {
              "@type": "ImageObject",
              "url": `${url}/flash-movies-logo.png`,
              "width": "400",
              "height": "400"
            },
            "description": "Free movie and TV show streaming platform offering HD streaming of popular movies and TV series",
            "foundingDate": "2024",
            "serviceType": ["Movie Streaming", "TV Show Streaming", "Entertainment"],
            "areaServed": "Worldwide",
            "knowsAbout": ["Movies", "TV Shows", "Entertainment", "Streaming"],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "availableLanguage": "English"
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default Meta;
