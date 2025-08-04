declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "../functions/Functions.js" {
  export const convertMinutesToHoursAndMinutes: (minutes: number) => string;
  export const formatTitle: (str: string) => string;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-helmet';