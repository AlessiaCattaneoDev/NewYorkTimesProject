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
      let decodedId: string | null = null;
      try {
        decodedId = decodeURIComponent(id);
      } catch {
        decodedId = null;
      }
      const found = articles.find((a) => encodeURIComponent(a.url) === id || a.url === decodedId);
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
