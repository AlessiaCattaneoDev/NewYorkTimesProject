/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NYT_TOP_STORIES_KEY: string;
  readonly VITE_NYT_MOST_POPULAR_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
