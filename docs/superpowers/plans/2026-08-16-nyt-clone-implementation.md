# NYT Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive React + TypeScript clone of the New York Times home page, powered by the NYT Top Stories and Most Popular APIs.

**Architecture:** A Vite + React + TypeScript SPA. Axios-based API layer calls NYT directly from the client. A single `AppContext` (Context API + `useReducer`) holds theme state and a per-section article cache, exposed through `useSection`/`useMostPopular` hooks. React Router drives Home / section / article-detail pages, all sharing a `Layout` (Header + Footer). Tailwind CSS (v4) handles styling, including class-based dark mode.

**Tech Stack:** React 18, Vite, TypeScript, React Router v6, Axios, Context API + `useReducer`, Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-08-16-nyt-clone-design.md`

## Global Constraints

- Project root is this directory (`React/`) — do NOT scaffold into a nested subfolder; the repo IS the project.
- **No git commits at any point during implementation.** The user commits manually so they remain the sole author in the git history. Every task below intentionally omits a "Commit" step — do not add one. It's fine to leave changes unstaged/uncommitted between tasks.
- **No automated test suite.** Per the spec, verification is manual: run `npm run dev` and check behavior in the browser as described in each task's "Manual verification" step. Do not add Vitest/RTL/Jest.
- TypeScript strict mode (Vite's `react-ts` template default) — do not loosen `tsconfig.json`.
- API calls happen directly from the client via Axios (no backend proxy). Keys live in `.env` (gitignored), read via `import.meta.env`.
- Exactly 7 sections, fixed: `home`, `world`, `us`, `politics`, `business`, `technology`, `arts` (see `SECTIONS` in `src/types/nyt.ts`, Task 2).
- Tailwind CSS v4 (the `@tailwindcss/vite` plugin, no `tailwind.config.js`/PostCSS setup needed). Dark mode is class-based via a `@custom-variant dark` declaration and a `dark` class toggled on `<html>`.
- Most Popular sidebar items link directly to the original nytimes.com URL (external, new tab) — they are NOT routed through the internal `/article/:id` detail page, since `MostPopularArticle` and `TopStoryArticle` have different shapes and the detail page is built only for the latter.

---

### Task 1: Scaffold project, Tailwind, dependencies, git init

**Files:**
- Create: entire Vite `react-ts` scaffold at project root (`package.json`, `tsconfig*.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`, etc.)
- Modify: `vite.config.ts`, `src/index.css`, `.gitignore`

**Interfaces:**
- Produces: a running Vite dev server (`npm run dev`) with Tailwind v4 active and `react-router-dom` + `axios` installed, ready for later tasks to build on.

- [ ] **Step 1: Scaffold Vite into a temp folder, then merge into project root**

The project root already contains `docs/`, so scaffold into a temp subfolder and merge with `rsync` (preserves hidden files like `.gitignore`):

```bash
npm create vite@latest nyt-clone-tmp -- --template react-ts
rsync -a nyt-clone-tmp/ ./
rm -rf nyt-clone-tmp
npm install
```

- [ ] **Step 2: Install project dependencies**

```bash
npm install react-router-dom axios
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Wire the Tailwind Vite plugin**

Replace the contents of `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 4: Replace global CSS with Tailwind import + class-based dark mode variant**

Replace the entire contents of `src/index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

body {
  font-family: ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 5: Ensure `.env` files are gitignored**

Append to `.gitignore` (create the entries if missing):

```
.env
.env.local
```

- [ ] **Step 6: Initialize git (no commit)**

```bash
git init
```

- [ ] **Step 7: Manual verification**

Temporarily replace the body of `src/App.tsx`'s returned JSX with `<h1 className="text-3xl font-bold underline">Tailwind works</h1>`, then:

```bash
npm run dev
```

Open the printed local URL in a browser. Confirm the heading renders large, bold, and underlined (proof Tailwind classes are being applied). Stop the dev server. Leave `App.tsx` as-is — Task 7 replaces its contents entirely.

---

### Task 2: TypeScript types + media helper

**Files:**
- Create: `src/types/nyt.ts`
- Create: `src/utils/media.ts`

**Interfaces:**
- Produces: `TopStoryArticle`, `TopStoriesResponse`, `MostPopularArticle`, `MostPopularResponse`, `SectionName`, `SECTIONS` (all from `src/types/nyt.ts`); `getArticleImageUrl(multimedia): string | null` (from `src/utils/media.ts`).

- [ ] **Step 1: Create the NYT API types**

Create `src/types/nyt.ts`:

```ts
export interface Multimedia {
  url: string;
  format: string;
  height: number;
  width: number;
  type: string;
  subtype: string;
  caption: string;
  copyright: string;
}

export interface TopStoryArticle {
  section: string;
  subsection: string;
  title: string;
  abstract: string;
  url: string;
  uri: string;
  byline: string;
  item_type: string;
  updated_date: string;
  created_date: string;
  published_date: string;
  material_type_facet: string;
  kicker: string;
  des_facet: string[];
  org_facet: string[];
  per_facet: string[];
  geo_facet: string[];
  multimedia: Multimedia[];
  short_url: string;
}

export interface TopStoriesResponse {
  status: string;
  copyright: string;
  section: string;
  last_updated: string;
  num_results: number;
  results: TopStoryArticle[];
}

export interface MostPopularMediaMetadata {
  url: string;
  format: string;
  height: number;
  width: number;
}

export interface MostPopularMedia {
  type: string;
  caption: string;
  copyright: string;
  approved_for_syndication: number;
  "media-metadata": MostPopularMediaMetadata[];
}

export interface MostPopularArticle {
  uri: string;
  url: string;
  id: number;
  asset_id: number;
  source: string;
  published_date: string;
  updated: string;
  section: string;
  subsection: string;
  byline: string;
  type: string;
  title: string;
  abstract: string;
  des_facet: string[];
  org_facet: string[];
  per_facet: string[];
  geo_facet: string[];
  media: MostPopularMedia[];
}

export interface MostPopularResponse {
  status: string;
  copyright: string;
  num_results: number;
  results: MostPopularArticle[];
}

export type SectionName =
  | "home"
  | "world"
  | "us"
  | "politics"
  | "business"
  | "technology"
  | "arts";

export const SECTIONS: { key: SectionName; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "world", label: "World" },
  { key: "us", label: "U.S." },
  { key: "politics", label: "Politics" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Technology" },
  { key: "arts", label: "Arts" },
];
```

- [ ] **Step 2: Create the media helper**

Create `src/utils/media.ts`:

```ts
import type { Multimedia } from "../types/nyt";

export function getArticleImageUrl(multimedia: Multimedia[] | undefined): string | null {
  if (!multimedia || multimedia.length === 0) {
    return null;
  }
  const preferred = multimedia.find((item) => item.format === "superJumbo") ?? multimedia[0];
  return preferred.url;
}
```

- [ ] **Step 3: Manual verification**

```bash
npx tsc --noEmit
```

Expected: no type errors (these are new, unused-but-valid files; `tsc` should report nothing about them).

---

### Task 3: API layer (Axios client, Top Stories, Most Popular)

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/topStories.ts`
- Create: `src/api/mostPopular.ts`
- Create: `.env.example`
- Create: `.env` (local only, gitignored — user fills in real keys)

**Interfaces:**
- Consumes: `SectionName`, `TopStoriesResponse`, `MostPopularResponse` (from `src/types/nyt.ts`, Task 2)
- Produces: `fetchTopStories(section: SectionName): Promise<TopStoriesResponse>`, `fetchMostPopular(days?: 1 | 7 | 30): Promise<MostPopularResponse>`

- [ ] **Step 1: Create the shared Axios client**

Create `src/api/client.ts`:

```ts
import axios from "axios";

export const nytClient = axios.create({
  baseURL: "https://api.nytimes.com/svc",
});
```

- [ ] **Step 2: Create the Top Stories API function**

Create `src/api/topStories.ts`:

```ts
import { nytClient } from "./client";
import type { SectionName, TopStoriesResponse } from "../types/nyt";

const TOP_STORIES_KEY = import.meta.env.VITE_NYT_TOP_STORIES_KEY as string;

export async function fetchTopStories(section: SectionName): Promise<TopStoriesResponse> {
  const response = await nytClient.get<TopStoriesResponse>(`/topstories/v2/${section}.json`, {
    params: { "api-key": TOP_STORIES_KEY },
  });
  return response.data;
}
```

- [ ] **Step 3: Create the Most Popular API function**

Create `src/api/mostPopular.ts`:

```ts
import { nytClient } from "./client";
import type { MostPopularResponse } from "../types/nyt";

const MOST_POPULAR_KEY = import.meta.env.VITE_NYT_MOST_POPULAR_KEY as string;

export async function fetchMostPopular(days: 1 | 7 | 30 = 7): Promise<MostPopularResponse> {
  const response = await nytClient.get<MostPopularResponse>(`/mostpopular/v2/viewed/${days}.json`, {
    params: { "api-key": MOST_POPULAR_KEY },
  });
  return response.data;
}
```

- [ ] **Step 4: Create `.env.example` and `.env`**

Create `.env.example`:

```
VITE_NYT_TOP_STORIES_KEY=your_top_stories_api_key_here
VITE_NYT_MOST_POPULAR_KEY=your_most_popular_api_key_here
```

Create `.env` (copy of the above) — **stop here and ask the user to fill in their real NYT Developer API keys before continuing to the manual verification step below.**

- [ ] **Step 5: Manual verification**

Temporarily add to `src/App.tsx` inside a `useEffect` (only for this check — revert after):

```tsx
useEffect(() => {
  fetchTopStories("home").then((data) => console.log("top stories", data));
  fetchMostPopular().then((data) => console.log("most popular", data));
}, []);
```

Run `npm run dev`, open the browser console. Confirm both `console.log` calls print response objects with a `results` array containing real articles (not a 401/403 error). Then revert `App.tsx` to its Task 1 state — Task 7 will rewrite it properly.

---

### Task 4: AppContext (theme + section cache + most popular state)

**Files:**
- Create: `src/context/AppContext.tsx`

**Interfaces:**
- Consumes: `SectionName`, `TopStoryArticle`, `MostPopularArticle` (from `src/types/nyt.ts`)
- Produces: `AppProvider` (component), `useAppContext(): { state: AppState; dispatch: Dispatch<AppAction> }`. `AppState` shape: `{ theme: "light" | "dark"; sections: Partial<Record<SectionName, { articles: TopStoryArticle[]; loading: boolean; error: string | null }>>; mostPopular: { articles: MostPopularArticle[]; loading: boolean; error: string | null } }`. Action types: `TOGGLE_THEME`, `SECTION_FETCH_START`, `SECTION_FETCH_SUCCESS`, `SECTION_FETCH_ERROR`, `MOST_POPULAR_FETCH_START`, `MOST_POPULAR_FETCH_SUCCESS`, `MOST_POPULAR_FETCH_ERROR`.

- [ ] **Step 1: Create the context, reducer, and provider**

Create `src/context/AppContext.tsx`:

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { MostPopularArticle, SectionName, TopStoryArticle } from "../types/nyt";

interface SectionState {
  articles: TopStoryArticle[];
  loading: boolean;
  error: string | null;
}

interface MostPopularState {
  articles: MostPopularArticle[];
  loading: boolean;
  error: string | null;
}

interface AppState {
  theme: "light" | "dark";
  sections: Partial<Record<SectionName, SectionState>>;
  mostPopular: MostPopularState;
}

type AppAction =
  | { type: "TOGGLE_THEME" }
  | { type: "SECTION_FETCH_START"; section: SectionName }
  | { type: "SECTION_FETCH_SUCCESS"; section: SectionName; articles: TopStoryArticle[] }
  | { type: "SECTION_FETCH_ERROR"; section: SectionName; error: string }
  | { type: "MOST_POPULAR_FETCH_START" }
  | { type: "MOST_POPULAR_FETCH_SUCCESS"; articles: MostPopularArticle[] }
  | { type: "MOST_POPULAR_FETCH_ERROR"; error: string };

function getInitialTheme(): "light" | "dark" {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const initialState: AppState = {
  theme: getInitialTheme(),
  sections: {},
  mostPopular: { articles: [], loading: false, error: null },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "SECTION_FETCH_START":
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: {
            articles: state.sections[action.section]?.articles ?? [],
            loading: true,
            error: null,
          },
        },
      };
    case "SECTION_FETCH_SUCCESS":
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: { articles: action.articles, loading: false, error: null },
        },
      };
    case "SECTION_FETCH_ERROR":
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.section]: {
            articles: state.sections[action.section]?.articles ?? [],
            loading: false,
            error: action.error,
          },
        },
      };
    case "MOST_POPULAR_FETCH_START":
      return { ...state, mostPopular: { ...state.mostPopular, loading: true, error: null } };
    case "MOST_POPULAR_FETCH_SUCCESS":
      return { ...state, mostPopular: { articles: action.articles, loading: false, error: null } };
    case "MOST_POPULAR_FETCH_ERROR":
      return { ...state, mostPopular: { ...state.mostPopular, loading: false, error: action.error } };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    localStorage.setItem("theme", state.theme);
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
```

- [ ] **Step 2: Manual verification**

```bash
npx tsc --noEmit
```

Expected: no type errors.

---

### Task 5: Custom hooks (`useSection`, `useMostPopular`)

**Files:**
- Create: `src/hooks/useSection.ts`
- Create: `src/hooks/useMostPopular.ts`

**Interfaces:**
- Consumes: `useAppContext` (Task 4), `fetchTopStories`/`fetchMostPopular` (Task 3), `SectionName` (Task 2)
- Produces: `useSection(section: SectionName): { articles: TopStoryArticle[]; loading: boolean; error: string | null; refetch: () => void }`, `useMostPopular(): { articles: MostPopularArticle[]; loading: boolean; error: string | null; refetch: () => void }`

- [ ] **Step 1: Create `useSection`**

Create `src/hooks/useSection.ts`:

```ts
import { useCallback, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { fetchTopStories } from "../api/topStories";
import type { SectionName } from "../types/nyt";

export function useSection(section: SectionName) {
  const { state, dispatch } = useAppContext();
  const sectionState = state.sections[section];

  const load = useCallback(async () => {
    dispatch({ type: "SECTION_FETCH_START", section });
    try {
      const data = await fetchTopStories(section);
      dispatch({ type: "SECTION_FETCH_SUCCESS", section, articles: data.results });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore nel caricamento degli articoli.";
      dispatch({ type: "SECTION_FETCH_ERROR", section, error: message });
    }
  }, [dispatch, section]);

  useEffect(() => {
    if (!sectionState) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return {
    articles: sectionState?.articles ?? [],
    loading: sectionState?.loading ?? true,
    error: sectionState?.error ?? null,
    refetch: load,
  };
}
```

- [ ] **Step 2: Create `useMostPopular`**

Create `src/hooks/useMostPopular.ts`:

```ts
import { useCallback, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { fetchMostPopular } from "../api/mostPopular";

export function useMostPopular() {
  const { state, dispatch } = useAppContext();
  const { articles, loading, error } = state.mostPopular;
  const hasLoaded = articles.length > 0;

  const load = useCallback(async () => {
    dispatch({ type: "MOST_POPULAR_FETCH_START" });
    try {
      const data = await fetchMostPopular();
      dispatch({ type: "MOST_POPULAR_FETCH_SUCCESS", articles: data.results });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore nel caricamento dei più letti.";
      dispatch({ type: "MOST_POPULAR_FETCH_ERROR", error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!hasLoaded) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { articles, loading, error, refetch: load };
}
```

- [ ] **Step 3: Manual verification**

```bash
npx tsc --noEmit
```

Expected: no type errors. (Full behavioral verification happens in Task 7 once these hooks are wired into rendered pages.)

---

### Task 6: Presentational primitives — `Loader`, `ErrorBanner`

**Files:**
- Create: `src/components/Loader.tsx`
- Create: `src/components/ErrorBanner.tsx`

**Interfaces:**
- Produces: `<Loader />` (no props), `<ErrorBanner message={string} onRetry={() => void} />`

- [ ] **Step 1: Create `Loader`**

Create `src/components/Loader.tsx`:

```tsx
export default function Loader() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100"
        role="status"
        aria-label="Caricamento"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `ErrorBanner`**

Create `src/components/ErrorBanner.tsx`:

```tsx
interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mx-auto my-8 flex max-w-xl flex-col items-center gap-3 rounded border border-red-300 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
      <p className="text-red-800 dark:text-red-200">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded bg-red-800 px-4 py-2 text-sm text-white hover:bg-red-900"
      >
        Riprova
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

```bash
npx tsc --noEmit
```

Expected: no type errors. (Visual verification happens in Task 7 where both are actually rendered.)

---

### Task 7: Article display components + routed Home/Section pages

**Files:**
- Create: `src/components/ArticleCard.tsx`
- Create: `src/components/HeroArticle.tsx`
- Create: `src/components/ArticleGrid.tsx`
- Create: `src/pages/SectionView.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/SectionPage.tsx`
- Create: `src/pages/NotFound.tsx`
- Create: `src/components/Layout.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useSection` (Task 5), `getArticleImageUrl` (Task 2), `Loader`/`ErrorBanner` (Task 6), `SECTIONS`/`SectionName`/`TopStoryArticle` (Task 2)
- Produces: `<ArticleCard article section />`, `<HeroArticle article section />`, `<ArticleGrid articles section />`, `<SectionView section />` (used internally by Home/SectionPage), routed pages at `/` and `/section/:sectionName`. Navigation target for article clicks: `/article/${encodeURIComponent(article.url)}?section=${section}` with router state `{ article }` (consumed by Task 10).

- [ ] **Step 1: Create `ArticleCard`**

Create `src/components/ArticleCard.tsx`:

```tsx
import { useNavigate } from "react-router-dom";
import { getArticleImageUrl } from "../utils/media";
import type { SectionName, TopStoryArticle } from "../types/nyt";

interface ArticleCardProps {
  article: TopStoryArticle;
  section: SectionName;
}

export default function ArticleCard({ article, section }: ArticleCardProps) {
  const navigate = useNavigate();
  const imageUrl = getArticleImageUrl(article.multimedia);

  function handleClick() {
    const id = encodeURIComponent(article.url);
    navigate(`/article/${id}?section=${section}`, { state: { article } });
  }

  return (
    <article
      onClick={handleClick}
      className="cursor-pointer border-b border-neutral-200 pb-4 dark:border-neutral-800"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={article.title}
          className="mb-2 aspect-video w-full object-cover"
        />
      )}
      <h3 className="font-serif text-lg font-bold leading-snug">{article.title}</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{article.abstract}</p>
      {article.byline && (
        <p className="mt-1 text-xs uppercase text-neutral-500">{article.byline}</p>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Create `HeroArticle`**

Create `src/components/HeroArticle.tsx`:

```tsx
import { useNavigate } from "react-router-dom";
import { getArticleImageUrl } from "../utils/media";
import type { SectionName, TopStoryArticle } from "../types/nyt";

interface HeroArticleProps {
  article: TopStoryArticle;
  section: SectionName;
}

export default function HeroArticle({ article, section }: HeroArticleProps) {
  const navigate = useNavigate();
  const imageUrl = getArticleImageUrl(article.multimedia);

  function handleClick() {
    const id = encodeURIComponent(article.url);
    navigate(`/article/${id}?section=${section}`, { state: { article } });
  }

  return (
    <article
      onClick={handleClick}
      className="mb-8 cursor-pointer border-b border-neutral-300 pb-6 dark:border-neutral-700"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={article.title}
          className="mb-4 aspect-video w-full object-cover"
        />
      )}
      <h2 className="font-serif text-3xl font-bold leading-tight lg:text-4xl">{article.title}</h2>
      <p className="mt-2 text-base text-neutral-700 dark:text-neutral-300">{article.abstract}</p>
      {article.byline && (
        <p className="mt-2 text-xs uppercase text-neutral-500">{article.byline}</p>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Create `ArticleGrid`**

Create `src/components/ArticleGrid.tsx`:

```tsx
import ArticleCard from "./ArticleCard";
import type { SectionName, TopStoryArticle } from "../types/nyt";

interface ArticleGridProps {
  articles: TopStoryArticle[];
  section: SectionName;
}

export default function ArticleGrid({ articles, section }: ArticleGridProps) {
  if (articles.length === 0) {
    return <p className="text-sm text-neutral-500">Nessun articolo disponibile.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {articles.map((article) => (
        <ArticleCard key={article.url} article={article} section={section} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `SectionView` (shared by Home and Section pages)**

Create `src/pages/SectionView.tsx`:

```tsx
import { useSection } from "../hooks/useSection";
import HeroArticle from "../components/HeroArticle";
import ArticleGrid from "../components/ArticleGrid";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import type { SectionName } from "../types/nyt";

interface SectionViewProps {
  section: SectionName;
}

export default function SectionView({ section }: SectionViewProps) {
  const { articles, loading, error, refetch } = useSection(section);

  if (loading && articles.length === 0) {
    return <Loader />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />;
  }

  const [hero, ...rest] = articles;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {hero && <HeroArticle article={hero} section={section} />}
      <ArticleGrid articles={rest} section={section} />
    </div>
  );
}
```

(Note: this version has no sidebar slot yet — Task 9 adds `MostPopularSidebar` and switches this to a two-column layout.)

- [ ] **Step 5: Create `Home` and `SectionPage`**

Create `src/pages/Home.tsx`:

```tsx
import SectionView from "./SectionView";

export default function Home() {
  return <SectionView section="home" />;
}
```

Create `src/pages/SectionPage.tsx`:

```tsx
import { useParams, Navigate } from "react-router-dom";
import SectionView from "./SectionView";
import { SECTIONS } from "../types/nyt";
import type { SectionName } from "../types/nyt";

export default function SectionPage() {
  const { sectionName } = useParams<{ sectionName: string }>();
  const isValid = SECTIONS.some((s) => s.key === sectionName);

  if (!sectionName || !isValid) {
    return <Navigate to="/404" replace />;
  }

  return <SectionView section={sectionName as SectionName} />;
}
```

- [ ] **Step 6: Create `NotFound`**

Create `src/pages/NotFound.tsx`:

```tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-serif text-4xl font-bold">404</h1>
      <p>Pagina non trovata.</p>
      <Link to="/" className="underline">
        Torna alla home
      </Link>
    </div>
  );
}
```

- [ ] **Step 7: Create a minimal `Layout` and wire routing in `App.tsx`**

Create `src/components/Layout.tsx`:

```tsx
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Outlet />
    </div>
  );
}
```

Replace the entire contents of `src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SectionPage from "./pages/SectionPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="section/:sectionName" element={<SectionPage />} />
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
```

(The `article/:id` route is added in Task 10 once `ArticleDetail` exists.)

- [ ] **Step 8: Manual verification**

```bash
npm run dev
```

In the browser:
1. Visit `/` — confirm a hero article and a grid of secondary articles render with real NYT titles/images/abstracts.
2. Visit `/section/technology` — confirm different articles load for that section.
3. Visit `/section/not-a-real-section` — confirm it redirects to the 404 page.
4. Visit `/section/world`, then go back to `/` — confirm `/` still shows data instantly (proves the context cache avoids a refetch).

---

### Task 8: Header, Nav, ThemeToggle, Footer

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Nav.tsx`
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/components/Footer.tsx`
- Modify: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: `useAppContext` (Task 4), `SECTIONS` (Task 2)
- Produces: full page chrome; `Layout` now renders `Header` + `<Outlet />` + `Footer`.

- [ ] **Step 1: Create `Nav`**

Create `src/components/Nav.tsx`:

```tsx
import { NavLink } from "react-router-dom";
import { SECTIONS } from "../types/nyt";

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm uppercase tracking-wide hover:underline ${isActive ? "font-bold underline" : "font-normal"}`;

  return (
    <nav className="flex flex-col gap-4 lg:flex-row lg:items-center">
      {SECTIONS.map((s) =>
        s.key === "home" ? (
          <NavLink key={s.key} to="/" end className={linkClass}>
            {s.label}
          </NavLink>
        ) : (
          <NavLink key={s.key} to={`/section/${s.key}`} className={linkClass}>
            {s.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Create `ThemeToggle`**

Create `src/components/ThemeToggle.tsx`:

```tsx
import { useAppContext } from "../context/AppContext";

export default function ThemeToggle() {
  const { state, dispatch } = useAppContext();

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "TOGGLE_THEME" })}
      aria-label="Cambia tema chiaro/scuro"
      className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700"
    >
      {state.theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
```

- [ ] **Step 3: Create `Header`**

Create `src/components/Header.tsx`:

```tsx
import { useState } from "react";
import Nav from "./Nav";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-neutral-300 dark:border-neutral-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{today}</p>
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-3 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight lg:text-6xl">
          The New York Times
        </h1>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-neutral-300 px-4 py-2 dark:border-neutral-700">
        <button
          type="button"
          className="text-sm lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Apri o chiudi il menu di navigazione"
        >
          {menuOpen ? "✕ Chiudi" : "☰ Menu"}
        </button>
        <div className={`${menuOpen ? "block" : "hidden"} w-full lg:block`}>
          <Nav />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `Footer`**

Create `src/components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-neutral-300 px-4 py-6 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
      <p>Progetto personale di pratica, non affiliato al New York Times. Dati forniti dalle NYT Developer API.</p>
    </footer>
  );
}
```

- [ ] **Step 5: Wire `Header`/`Footer` into `Layout`**

Replace `src/components/Layout.tsx`:

```tsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 6: Manual verification**

```bash
npm run dev
```

In the browser:
1. Confirm the header shows the date, the "The New York Times" wordmark, and 7 nav links (Home, World, U.S., Politics, Business, Technology, Arts).
2. Click each nav link — confirm the URL and displayed articles change, and the active link is bold/underlined.
3. Click the dark/light toggle — confirm the whole page (including footer) switches color scheme immediately.
4. Reload the page — confirm the theme choice persisted (was read back from `localStorage`).
5. Resize the browser below ~1024px — confirm the nav collapses behind a "☰ Menu" button that toggles it open/closed.

---

### Task 9: Most Popular sidebar

**Files:**
- Create: `src/components/MostPopularSidebar.tsx`
- Modify: `src/pages/SectionView.tsx`

**Interfaces:**
- Consumes: `useMostPopular` (Task 5)
- Produces: `<MostPopularSidebar />`, wired into `SectionView`'s layout (so it appears on both Home and every section page).

- [ ] **Step 1: Create `MostPopularSidebar`**

Create `src/components/MostPopularSidebar.tsx`:

```tsx
import { useMostPopular } from "../hooks/useMostPopular";
import Loader from "./Loader";
import ErrorBanner from "./ErrorBanner";

export default function MostPopularSidebar() {
  const { articles, loading, error, refetch } = useMostPopular();

  return (
    <section className="rounded border border-neutral-300 p-4 dark:border-neutral-700">
      <h2 className="mb-3 font-serif text-lg font-bold uppercase">Più letti</h2>
      {loading && articles.length === 0 && <Loader />}
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      {!loading && !error && (
        <ol className="flex flex-col gap-3">
          {articles.slice(0, 10).map((article, index) => (
            <li key={article.url} className="flex gap-3">
              <span className="font-serif text-2xl font-bold text-neutral-400">{index + 1}</span>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold leading-snug hover:underline"
              >
                {article.title}
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Add the sidebar to `SectionView`'s layout**

Replace `src/pages/SectionView.tsx`:

```tsx
import { useSection } from "../hooks/useSection";
import HeroArticle from "../components/HeroArticle";
import ArticleGrid from "../components/ArticleGrid";
import MostPopularSidebar from "../components/MostPopularSidebar";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import type { SectionName } from "../types/nyt";

interface SectionViewProps {
  section: SectionName;
}

export default function SectionView({ section }: SectionViewProps) {
  const { articles, loading, error, refetch } = useSection(section);

  if (loading && articles.length === 0) {
    return <Loader />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />;
  }

  const [hero, ...rest] = articles;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
      <div className="flex-1">
        {hero && <HeroArticle article={hero} section={section} />}
        <ArticleGrid articles={rest} section={section} />
      </div>
      <aside className="w-full lg:w-80">
        <MostPopularSidebar />
      </aside>
    </div>
  );
}
```

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

Visit `/`. Confirm a "Più letti" box renders alongside the main articles with a numbered list of up to 10 titles. Click one of its links — confirm it opens the real nytimes.com article in a new tab (not the internal `/article/:id` route). Navigate to `/section/business` and confirm the sidebar still renders (same most-popular data, not refetched — check the Network tab shows no new `mostpopular` request).

---

### Task 10: Article detail page

**Files:**
- Create: `src/pages/ArticleDetail.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useSection` (Task 5), `getArticleImageUrl` (Task 2), `SECTIONS`/`SectionName`/`TopStoryArticle` (Task 2), `Loader`/`ErrorBanner` (Task 6)
- Produces: routed page at `/article/:id`, reading `location.state.article` (set by `ArticleCard`/`HeroArticle` in Task 7) with a fallback that re-fetches the originating section (from the `?section=` query param) and finds the article by matching `encodeURIComponent(article.url) === id`.

- [ ] **Step 1: Create `ArticleDetail`**

Create `src/pages/ArticleDetail.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams, Link } from "react-router-dom";
import { useSection } from "../hooks/useSection";
import { getArticleImageUrl } from "../utils/media";
import Loader from "../components/Loader";
import ErrorBanner from "../components/ErrorBanner";
import { SECTIONS } from "../types/nyt";
import type { SectionName, TopStoryArticle } from "../types/nyt";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateArticle = (location.state as { article?: TopStoryArticle } | null)?.article;

  const sectionParam = searchParams.get("section");
  const fallbackSection: SectionName = SECTIONS.some((s) => s.key === sectionParam)
    ? (sectionParam as SectionName)
    : "home";

  const { articles, loading, error, refetch } = useSection(fallbackSection);
  const [article, setArticle] = useState<TopStoryArticle | null>(stateArticle ?? null);

  useEffect(() => {
    if (!article && id) {
      const found = articles.find((a) => encodeURIComponent(a.url) === id);
      if (found) {
        setArticle(found);
      }
    }
  }, [article, articles, id]);

  if (!article && loading) {
    return <Loader />;
  }

  if (!article && error) {
    return <ErrorBanner message={error} onRetry={refetch} />;
  }

  if (!article) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <p>Articolo non trovato.</p>
        <Link to="/" className="underline">
          Torna alla home
        </Link>
      </div>
    );
  }

  const imageUrl = getArticleImageUrl(article.multimedia);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase text-neutral-500">{article.section}</p>
      <h1 className="mt-2 font-serif text-3xl font-bold leading-tight lg:text-5xl">
        {article.title}
      </h1>
      {article.byline && (
        <p className="mt-3 text-sm uppercase text-neutral-500">{article.byline}</p>
      )}
      {imageUrl && (
        <img src={imageUrl} alt={article.title} className="my-6 w-full object-cover" />
      )}
      <p className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">
        {article.abstract}
      </p>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-block underline"
      >
        Leggi l'articolo completo su nytimes.com →
      </a>
    </article>
  );
}
```

- [ ] **Step 2: Add the route in `App.tsx`**

In `src/App.tsx`, add the import and the route:

```tsx
import ArticleDetail from "./pages/ArticleDetail";
```

Add inside `<Routes>`, alongside the existing routes (before the `404`/`*` routes):

```tsx
<Route path="article/:id" element={<ArticleDetail />} />
```

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

1. From `/`, click an article card — confirm it navigates to `/article/<encoded-url>?section=home` and immediately shows the full detail view (title, image, abstract, byline, "Leggi l'articolo completo" link) with no loading flash (proves it used `location.state`, not a refetch).
2. Copy that detail page's URL, open it in a fresh browser tab (no router state) — confirm it still renders the correct article after a brief load (proves the fallback re-fetch + find-by-id works).
3. Click the external link — confirm it opens the real nytimes.com article in a new tab.
4. Manually edit the URL to an `/article/` id that doesn't exist in that section — confirm it shows "Articolo non trovato." with a link back home, not a crash.

---

### Task 11: Responsive & accessibility polish pass

**Files:**
- Modify: any of `src/components/Header.tsx`, `src/components/Nav.tsx`, `src/components/ArticleGrid.tsx`, `src/pages/SectionView.tsx` — only if a check below fails

**Interfaces:**
- No new interfaces — this task only adjusts Tailwind classes on existing components if a concrete check fails.

- [ ] **Step 1: Check the 375px (mobile) breakpoint**

```bash
npm run dev
```

Open browser devtools, set responsive width to 375px. Visit `/`. Confirm: the hamburger menu is visible and the inline nav is hidden; the hero article and grid cards stack in a single column; the "Più letti" sidebar appears below the main content (not squeezed beside it); no horizontal scrollbar appears on the page. If any of these fail, fix the relevant Tailwind classes in `Header.tsx` / `SectionView.tsx` (e.g. adjust `lg:` breakpoint usage or add `overflow-x-hidden` where needed) and recheck.

- [ ] **Step 2: Check the 768px (tablet) breakpoint**

Set responsive width to 768px. Confirm: `ArticleGrid` shows 2 columns (the `sm:grid-cols-2` class is active); the mobile hamburger is still shown (breakpoint is `lg`, i.e. 1024px) — confirm this matches intent, and if a tablet-specific inline nav is wanted, change `Nav`'s wrapper in `Header.tsx` from `lg:block` to `md:block` and re-test at both 768px and 375px to confirm it doesn't break the mobile layout.

- [ ] **Step 3: Check the 1280px (desktop) breakpoint**

Set responsive width to 1280px. Confirm: full inline nav is visible, hamburger button is hidden; the layout is centered with `max-w-6xl` (not stretched edge-to-edge); the sidebar sits beside the main content, not below it.

- [ ] **Step 4: Keyboard and screen-reader spot check**

Using only the Tab key, confirm you can reach and activate: each nav link, the theme toggle button, an article card (cards are `<article>` with an `onClick` — if Tab does not reach them, add `tabIndex={0}`, `role="button"`, and an `onKeyDown` handler calling the same `handleClick` on Enter/Space to `ArticleCard.tsx` and `HeroArticle.tsx`), and the mobile menu button. Confirm the theme toggle and mobile menu button already have `aria-label`/`aria-expanded` (added in Task 8) and are read sensibly by browser accessibility tools (e.g. Chrome DevTools "Accessibility" pane).

- [ ] **Step 5: Manual verification**

Re-run Steps 1–3 one more time after any fixes to confirm nothing regressed at the other breakpoints.

---

### Task 12: README

**Files:**
- Create: `README.md` (overwrite the Vite-generated default)

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Write the README**

Replace `README.md`:

```markdown
# NYT Clone

Clone della home page del New York Times, costruito come progetto di pratica personale con React, TypeScript e le NYT Developer API.

Non è affiliato al New York Times. I dati sono ottenuti dalle API pubbliche NYT (Top Stories, Most Popular).

## Stack

- React 18 + Vite + TypeScript
- React Router v6
- Axios
- Context API + `useReducer`
- Tailwind CSS v4

## Setup

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Crea un file `.env` nella root (basato su `.env.example`) con due chiavi ottenute da [developer.nytimes.com](https://developer.nytimes.com/get-started): una per **Top Stories API**, una per **Most Popular API**.

   ```
   VITE_NYT_TOP_STORIES_KEY=la_tua_chiave
   VITE_NYT_MOST_POPULAR_KEY=la_tua_chiave
   ```

3. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

## Funzionalità

- Home e 6 sezioni (World, U.S., Politics, Business, Technology, Arts) via Top Stories API.
- Sidebar "Più letti" via Most Popular API.
- Pagina di dettaglio interna per ogni articolo, con link all'articolo originale su nytimes.com.
- Dark/light mode con persistenza in `localStorage`.
- Design responsive.
```

- [ ] **Step 2: Manual verification**

Open `README.md` in a Markdown preview and confirm it renders cleanly with no broken formatting, and that the setup steps match what Task 3 actually requires (two separate `.env` keys).

---

## Post-plan note

No task in this plan runs `git add`/`git commit` — per the Global Constraints, the assistant must not commit. Once all tasks are verified, the user can review `git status`/`git diff` and commit at their own pace.
