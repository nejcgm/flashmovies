import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

interface IMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  image?: string;
  robots?: string;
  type?: "website" | "video.movie" | "video.tv_show" | "article";
  siteName?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const Meta = ({
  title,
  description,
  keywords = [],
  url="https://flashmovies.xyz",
  image="https://flashmovies.xyz/flash-movies-logo.png",
  robots="index, follow",
  type = "website",
  siteName = "Flash Movies",
  publishedTime="2025-08-04",
  modifiedTime=new Date().toISOString(),
}: IMetaProps) => {

  useEffect(() => {
    window.prerenderReady = true;
  }, []);

  const [savedTitle, setSavedTitle] = useState<string>()
  // Default values for dynamic content
  const defaultTitle = "Flash Movies - Free Movie Streaming";
  const defaultDescription = "Watch free movies and TV shows online on Flash Movies. Stream the latest movies and popular TV series in HD for free, anytime and anywhere.";
  const defaultKeywords = [
    "flash movies", "flashmovies", "flashmovies.xyz", "flash movie", "flash",
    "free movies", "movie streaming", "watch movies online", "watch tv shows online",
    "free tv shows", "stream movies free", "online movie platform", "HD movies", "TV series streaming"
  ];

  // Use provided values or defaults
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords.length > 0 ? keywords : defaultKeywords;

  useEffect(() => {
    setSavedTitle(finalTitle)
  }, [finalTitle])

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
      {/* Always render title, description and keywords (with defaults if not provided) */}
      <title>{savedTitle || finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(", ")} />
      {robots && <meta name="robots" content={robots} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook - Always render title and description */}
      {type && <meta property="og:type" content={type} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      {absoluteImageUrl && <meta property="og:image" content={absoluteImageUrl} />}
      {absoluteImageUrl && <meta property="og:image:width" content={imageDimensions.width} />}
      {absoluteImageUrl && <meta property="og:image:height" content={imageDimensions.height} />}
      <meta property="og:image:alt" content={finalTitle} />
      {absoluteImageUrl && <meta property="og:image:type" content="image/png" />}
      {absoluteImageUrl && <meta property="og:image:secure_url" content={absoluteImageUrl} />}
      {siteName && <meta property="og:site_name" content={siteName} />}
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter - Always render title and description */}
      <meta name="twitter:card" content="summary_large_image" />
      {url && <meta name="twitter:url" content={url} />}
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {absoluteImageUrl && <meta name="twitter:image" content={absoluteImageUrl} />}
      <meta name="twitter:image:alt" content={finalTitle} />
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
