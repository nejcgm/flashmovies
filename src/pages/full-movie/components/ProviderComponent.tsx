import React, { useState, useEffect } from "react";
import ProviderButton from "./ProviderButton";

interface ProviderComponentProps {
  newProvider: (providerUrl: string) => void;
  title?: string;
  movieId: string;
  type: string;
  className?: string;
}

const ProviderComponent = ({
  newProvider,
  title,
  movieId,
  type,
  className,  
}: ProviderComponentProps) => {
  const [providerUrl, setProviderUrl] = useState(
    `https://vidsrc.pm/embed/${type}/${movieId}`
  );
  const [selectedProvider, setSelectedProvider] = useState("VidSrc");

  useEffect(() => {
    newProvider(providerUrl);
  }, [providerUrl, newProvider]);

  const handleProviderSelection = (provider: string, url: string) => {
    setSelectedProvider(provider);
    setProviderUrl(url);
  };

  return (
    <>
      <div className={`${className}`}>
        <div className="font-bold text-[24px] text-blue-400">{title}</div>
        <div className="flex flex-wrap gap-2 mt-4">
          <ProviderButton
            provider="VidSrc"
            url={`https://vidsrc.pm/embed/${type}/${movieId}`}
            updateProvider={(url) => {
              handleProviderSelection("VidSrc", url);
            }}
            className={
              selectedProvider === "VidSrc" ? "bg-yellow-500" : "bg-gray-500"
            }
          />
          <ProviderButton
            provider="MoviesAPI Club"
            url={`https://moviesapi.club/${type}/${movieId}`}
            updateProvider={(url) =>
              handleProviderSelection("MoviesAPI Club", url)
            }
            className={
              selectedProvider === "MoviesAPI Club"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }
          />
          <ProviderButton
            provider="Embed.su"
            url={`https://embed.su/embed/${type}/${movieId}`}
            updateProvider={(url) => handleProviderSelection("Embed.su", url)}
            className={
              selectedProvider === "Embed.su" ? "bg-yellow-500" : "bg-gray-500"
            }
          />
        </div>
      </div>
    </>
  );
};

export default ProviderComponent;
