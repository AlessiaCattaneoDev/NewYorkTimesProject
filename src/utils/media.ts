import type { Multimedia } from "../types/nyt";

export function getArticleImageUrl(multimedia: Multimedia[] | undefined): string | null {
  if (!multimedia || multimedia.length === 0) {
    return null;
  }
  const preferred = multimedia.find((item) => item.format === "superJumbo") ?? multimedia[0];
  return preferred.url;
}
