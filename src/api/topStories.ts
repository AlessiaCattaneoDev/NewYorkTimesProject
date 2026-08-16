import { nytClient } from "./client";
import type { SectionName, TopStoriesResponse } from "../types/nyt";

const TOP_STORIES_KEY = import.meta.env.VITE_NYT_TOP_STORIES_KEY as string;

export async function fetchTopStories(section: SectionName): Promise<TopStoriesResponse> {
  const response = await nytClient.get<TopStoriesResponse>(`/topstories/v2/${section}.json`, {
    params: { "api-key": TOP_STORIES_KEY },
  });
  return response.data;
}
