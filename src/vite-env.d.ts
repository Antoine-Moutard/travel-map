/// <reference types="vite/client" />

declare module '@tailwindcss/vite';

interface ImportMetaEnv {
  readonly VITE_MAPTILER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
