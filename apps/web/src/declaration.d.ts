declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "react-helmet-async";

declare global {
  interface Window {
    prerenderReady: boolean;
    dataLayer?: unknown[];
    gtag?: (
      command: string,
      action: string | Date,
      parameters?: Record<string, unknown>,
    ) => void;
    _uxa?: unknown[];
  }
}

export {};
