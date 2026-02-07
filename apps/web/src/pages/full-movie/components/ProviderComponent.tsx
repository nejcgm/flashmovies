import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProviderButton from "./ProviderButton";
import { STREAMING_PROVIDERS } from "../../../config/streamingProviders";
import { useUser } from "../../../context/UserContext";

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
  const { isPro } = useUser();
  const navigate = useNavigate();

  const providers = STREAMING_PROVIDERS.map((provider) => ({
    name: provider.name,
    url: provider.url(type, movieId),
    description: provider.description,
    priority: provider.priority,
    isEpisodeSlugPartOfSlug: provider.isEpisodeSlugPartOfSlug,
    params: provider.params,
    isPremium: provider.isPremium || false,
  }));

  // Get the first accessible provider (first non-premium for non-pro users)
  const getDefaultProvider = () => {
    if (isPro) return providers[0];
    return providers.find((p) => !p.isPremium) || providers[0];
  };

  const defaultProvider = getDefaultProvider();

  const [providerUrl, setProviderUrl] = useState(defaultProvider.url);
  const [selectedProvider, setSelectedProvider] = useState(defaultProvider.name);
  const [isEpisodeSlugPartOfSlug, setIsEpisodeSlugPartOfSlug] =
    useState<boolean>(defaultProvider.isEpisodeSlugPartOfSlug);
  const [params, setParams] = useState(defaultProvider.params);

  useEffect(() => {
    newProvider(providerUrl, isEpisodeSlugPartOfSlug, params);
  }, [providerUrl, isEpisodeSlugPartOfSlug, params, newProvider]);

  // Update default provider when isPro changes or movieId/type changes
  useEffect(() => {
    const newDefault = isPro ? providers[0] : (providers.find((p) => !p.isPremium) || providers[0]);
    setSelectedProvider(newDefault.name);
    setProviderUrl(newDefault.url);
    setIsEpisodeSlugPartOfSlug(newDefault.isEpisodeSlugPartOfSlug);
    setParams(newDefault.params);
  }, [isPro, movieId, type]);

  const handleProviderSelection = (
    provider: string,
    url: string,
    isEpisodeSlugPartOfSlug: boolean,
    isPremium: boolean,
    params?: string
  ) => {
    // If non-pro user clicks premium provider, redirect to plans page
    if (isPremium && !isPro) {
      navigate('/payments/plans');
      return;
    }

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
                  provider.isPremium,
                  provider.params
                );
              }}
              className={
                selectedProvider === provider.name
                  ? "bg-yellow-500"
                  : provider.isPremium && !isPro
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-100 opacity-80"
                  : "bg-gray-500"
              }
              isPremium={provider.isPremium}
              isLocked={provider.isPremium && !isPro}
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
