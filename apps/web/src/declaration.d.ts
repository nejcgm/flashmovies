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
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

export {};
