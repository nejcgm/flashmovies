import React, { useState, useEffect } from "react";
import ProviderButton from "./ProviderButton";
import { STREAMING_PROVIDERS } from "../../../config/streamingProviders";

interface ProviderComponentProps {
  newProvider: (providerUrl: string) => void;
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
  }));

  const [providerUrl, setProviderUrl] = useState(providers[0].url);
  const [selectedProvider, setSelectedProvider] = useState(providers[0].name);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [failedProviders, setFailedProviders] = useState<string[]>([]);

  useEffect(() => {
    newProvider(providerUrl);
  }, [providerUrl, newProvider]);

  const handleProviderSelection = (provider: string, url: string) => {
    setSelectedProvider(provider);
    setProviderUrl(url);
    const index = providers.findIndex((p) => p.name === provider);
    setCurrentProviderIndex(index);
    setIframeKey((prev) => prev + 1);
  };

  const handleProviderError = () => {
    if (!failedProviders.includes(selectedProvider)) {
      setFailedProviders((prev) => [...prev, selectedProvider]);
    }

    if (currentProviderIndex < providers.length - 1) {
      const nextProvider = providers[currentProviderIndex + 1];
      handleProviderSelection(nextProvider.name, nextProvider.url);
    }
  };

  const handleIframeError = () => {
    handleProviderError();
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
                handleProviderSelection(provider.name, url);
              }}
              className={
                selectedProvider === provider.name
                  ? "bg-yellow-500"
                  : failedProviders.includes(provider.name)
                  ? "bg-red-500 opacity-50"
                  : "bg-gray-500"
              }
            />
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-400">
          {getCurrentProviderDescription()}
        </div>
      </div>

      <iframe
        key={iframeKey}
        src={providerUrl}
        style={{ display: "none" }}
        onError={handleIframeError}
        allow="encrypted-media"
      />
    </>
  );
};

export default ProviderComponent;
