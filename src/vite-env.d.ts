/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_UNIVAPAY_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
