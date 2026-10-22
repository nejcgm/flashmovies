import { useState, useEffect } from "react";
import { ProviderButton } from "./";
import { STREAMING_PROVIDERS } from "../../../config/streamingProviders";
import type { EpisodeSlugStyle } from "../../../interfaces/config/index.ts";
import { useUser } from "../../../context/UserContext";
import { useProUpsell } from "../../../context/ProUpsellContext";

interface ProviderComponentProps {
  newProvider: (
    providerUrl: string,
    isEpisodeSlugPartOfSlug: boolean,
    params?: string,
    episodeSlugStyle?: EpisodeSlugStyle,
  ) => void;
  title?: string;
  movieId: string;
  type: string;
  className?: string;
  description?: string;
}

export function ProviderComponent({
  newProvider,
  title,
  movieId,
  type,
  className,
  description,
}: ProviderComponentProps) {
  const { isPro } = useUser();
  const { openProUpsell } = useProUpsell();

  const providers = STREAMING_PROVIDERS.map((provider) => ({
    name: provider.name,
    url: provider.url(type, movieId),
    description: provider.description,
    priority: provider.priority,
    isEpisodeSlugPartOfSlug: provider.isEpisodeSlugPartOfSlug,
    episodeSlugStyle: provider.episodeSlugStyle,
    params: provider.params,
    isPremium: provider.isPremium || false,
    underMaintenance: provider.underMaintenance || false,
  }));

  const getDefaultProvider = () => {
    if (isPro) {
      return providers.find((p) => p.isPremium && !p.underMaintenance) || providers[0];
    }
    return providers.find((p) => !p.isPremium) || providers[0];
  };

  const defaultProvider = getDefaultProvider();

  const [providerUrl, setProviderUrl] = useState(defaultProvider.url);
  const [selectedProvider, setSelectedProvider] = useState(defaultProvider.name);
  const [isEpisodeSlugPartOfSlug, setIsEpisodeSlugPartOfSlug] =
    useState<boolean>(defaultProvider.isEpisodeSlugPartOfSlug);
  const [episodeSlugStyle, setEpisodeSlugStyle] = useState<EpisodeSlugStyle | undefined>(
    defaultProvider.episodeSlugStyle,
  );
  const [params, setParams] = useState(defaultProvider.params);

  useEffect(() => {
    newProvider(providerUrl, isEpisodeSlugPartOfSlug, params, episodeSlugStyle);
  }, [providerUrl, isEpisodeSlugPartOfSlug, episodeSlugStyle, params, newProvider]);

  useEffect(() => {
    const newDefault = isPro
      ? providers.find((p) => p.isPremium && !p.underMaintenance) || providers[0]
      : providers.find((p) => !p.isPremium) || providers[0];
    setSelectedProvider(newDefault.name);
    setProviderUrl(newDefault.url);
    setIsEpisodeSlugPartOfSlug(newDefault.isEpisodeSlugPartOfSlug);
    setEpisodeSlugStyle(newDefault.episodeSlugStyle);
    setParams(newDefault.params);
  }, [isPro, movieId, type]);

  const handleProviderSelection = (
    provider: string,
    url: string,
    isEpisodeSlugPartOfSlug: boolean,
    isPremium: boolean,
    params?: string,
    episodeSlugStyle?: EpisodeSlugStyle,
  ) => {
    if (isPremium && !isPro) {
      openProUpsell('premium_server');
      return;
    }

    if (isPremium && isPro && providers.find((p) => p.name === provider)?.underMaintenance) {
      return;
    }

    setSelectedProvider(provider);
    setProviderUrl(url);
    setIsEpisodeSlugPartOfSlug(isEpisodeSlugPartOfSlug);
    setEpisodeSlugStyle(episodeSlugStyle);
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
          {providers.map((provider) => {
            const isMaintenance = Boolean(provider.underMaintenance && isPro);

            return (
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
                  provider.params,
                  provider.episodeSlugStyle,
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
              isMaintenance={isMaintenance}
              showDiscountCallout={provider.isPremium && !isPro}
            />
            );
          })}
        </div>

        <div className="mt-2 text-sm text-gray-400">
          {getCurrentProviderDescription()}
        </div>
      </div>
    </>
  );
};

