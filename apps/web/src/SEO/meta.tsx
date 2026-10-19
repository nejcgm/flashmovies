import { useEffect, useState } from "react";
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

export function Meta({
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
}: IMetaProps) {

  useEffect(() => {
    window.prerenderReady = true;
  }, []);

  const [savedTitle, setSavedTitle] = useState<string>()
  const defaultTitle = "Flash Movies — Watch Free Movies & TV Shows Online";
  const defaultDescription =
    "Flash Movies (flashmovies.xyz) is a free movie and TV streaming website. Watch movies and TV shows online in HD — browse popular and trending titles, explore details and cast, and start watching with no subscription required.";
  const defaultKeywords = [
    "flash movies", "flashmovies", "flashmovies.xyz", "flash",
    "free movies", "movie streaming", "watch movies online on flashmovies", "watch tv shows online on flashmovies",
    "free tv shows", "stream movies free", "online movie platform", "HD movies", "TV series streaming"
  ];

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords.length > 0 ? keywords : defaultKeywords;

  useEffect(() => {
    setSavedTitle(finalTitle)
  }, [finalTitle])

  const absoluteImageUrl = image?.startsWith('http') 
    ? image 
    : image?.startsWith('/') 
      ? `https://flashmovies.xyz${image}`
      : `https://flashmovies.xyz/${image}`;

  const getImageDimensions = (imageUrl: string) => {
    if (imageUrl.includes('image.tmdb.org/t/p/w1280')) {
      return { width: "1280", height: "720" }; // 16:9 ratio for backdrops
    }
    if (imageUrl.includes('image.tmdb.org/t/p/w500')) {
      return { width: "500", height: "750" }; // 2:3 ratio for posters
    }
    return { width: "1200", height: "630" }; // 1.91:1 ratio recommended by Facebook
  };

  const imageDimensions = getImageDimensions(absoluteImageUrl);

  return (
    <Helmet>
      <title>{savedTitle || finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(", ")} />
      {robots && <meta name="robots" content={robots} />}
      {url && <link rel="canonical" href={url} />}

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

      <meta name="twitter:card" content="summary_large_image" />
      {url && <meta name="twitter:url" content={url} />}
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {absoluteImageUrl && <meta name="twitter:image" content={absoluteImageUrl} />}
      <meta name="twitter:image:alt" content={finalTitle} />
      <meta name="twitter:site" content="@flashmovies" />
      <meta name="twitter:creator" content="@flashmovies" />

      <meta name="format-detection" content="telephone=no" />
      <meta name="referrer" content="origin-when-cross-origin" />
    </Helmet>
  );
};

