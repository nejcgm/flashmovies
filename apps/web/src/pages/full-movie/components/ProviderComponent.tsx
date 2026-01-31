import React, { useState, useEffect } from "react";
import ProviderButton from "./ProviderButton";
import { STREAMING_PROVIDERS } from "../../../config/streamingProviders";

interface ProviderComponentProps {
  newProvider: (
    providerUrl: string,
    isEpisodeSlugPartOfSlug: boolean,
    params?: string
  ) => void;
  title?: string;
  movieId: string;
  type: string;
  className?: string;
  description?: string;
}

const ProviderComponent = ({
  newProvider,
  title,
  movieId,
  type,
  className,
  description,
}: ProviderComponentProps) => {
  const providers = STREAMING_PROVIDERS.map((provider) => ({
    name: provider.name,
    url: provider.url(type, movieId),
    description: provider.description,
    priority: provider.priority,
    isEpisodeSlugPartOfSlug: provider.isEpisodeSlugPartOfSlug,
    params: provider.params,
  }));

  const [providerUrl, setProviderUrl] = useState(providers[0].url);
  const [selectedProvider, setSelectedProvider] = useState(providers[0].name);
  const [isEpisodeSlugPartOfSlug, setIsEpisodeSlugPartOfSlug] =
    useState<boolean>(providers[0].isEpisodeSlugPartOfSlug);
  const [params, setParams] = useState(providers[0].params);

  useEffect(() => {
    newProvider(providerUrl, isEpisodeSlugPartOfSlug, params);
  }, [providerUrl, isEpisodeSlugPartOfSlug, params, newProvider]);

  const handleProviderSelection = (
    provider: string,
    url: string,
    isEpisodeSlugPartOfSlug: boolean,
    params?: string
  ) => {
    setSelectedProvider(provider);
    setProviderUrl(url);
    setIsEpisodeSlugPartOfSlug(isEpisodeSlugPartOfSlug);
    setParams(params);
  };

  const getCurrentProviderDescription = () => {
    const currentProvider = providers.find((p) => p.name === selectedProvider);
    return currentProvider?.description || "";
  };

  return (
    <>
      <div className={className}>
        <div className="font-semibold text-lg sm:text-[24px] mb-1 text-yellow-500">
          {title}
        </div>
        <div className="sm:mb-1 text-gray-400 text-xs sm:text-sm">
          {description}
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3 mt-4">
          {providers.map((provider) => (
            <ProviderButton
              key={provider.name}
              provider={provider.name}
              url={provider.url}
              updateProvider={(url) => {
                handleProviderSelection(
                  provider.name,
                  url,
                  provider.isEpisodeSlugPartOfSlug,
                  provider.params
                );
              }}
              className={
                selectedProvider === provider.name
                  ? "bg-yellow-500"
                  : "bg-gray-500"
              }
            />
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-400">
          {getCurrentProviderDescription()}
        </div>
      </div>
    </>
  );
};

export default ProviderComponent;
