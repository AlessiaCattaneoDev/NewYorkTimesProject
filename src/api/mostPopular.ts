import { nytClient } from "./client";
import type { MostPopularResponse } from "../types/nyt";

const MOST_POPULAR_KEY = import.meta.env.VITE_NYT_MOST_POPULAR_KEY as string;

export async function fetchMostPopular(days: 1 | 7 | 30 = 7): Promise<MostPopularResponse> {
  const response = await nytClient.get<MostPopularResponse>(`/mostpopular/v2/viewed/${days}.json`, {
    params: { "api-key": MOST_POPULAR_KEY },
  });
  return response.data;
}
