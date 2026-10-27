import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { serverEnv } from "../env.server";
import { ApiError } from "./errors";
import type {
  CatalogCategory,
  CatalogCategoryList,
  CatalogVideoDetailResponse,
  CatalogVideoList,
} from "./types";

/**
 * Public catalog reads. The data is the same for every visitor, so it's
 * cached on the server for a few minutes (`use cache`) and never carries a
 * visitor's cookies.
 */
async function publicGet<T>(path: string): Promise<T> {
  const env = serverEnv();
  let response: Response;
  try {
    response = await fetch(new URL(`/v1${path}`, env.API_INTERNAL_URL), {
      headers: {
        accept: "application/json",
        "x-proxy-secret": env.API_PROXY_SECRET,
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw ApiError.network();
  }
  if (!response.ok) throw await ApiError.fromResponse(response);
  return (await response.json()) as T;
}

export interface CatalogQuery {
  q?: string;
  category?: string;
  access?: "free" | "paid";
  sort?: "newest" | "oldest" | "title" | "price_low" | "price_high";
  page?: number;
  limit?: number;
}

function toSearch(query: CatalogQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

export async function getCatalogVideos(
  query: CatalogQuery,
): Promise<CatalogVideoList> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return publicGet<CatalogVideoList>(`/catalog/videos${toSearch(query)}`);
}

/** Null when the video doesn't exist or isn't published. */
export async function getCatalogVideo(
  slug: string,
): Promise<CatalogVideoDetailResponse | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  try {
    return await publicGet<CatalogVideoDetailResponse>(
      `/catalog/videos/${encodeURIComponent(slug)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Categories for the chip bar and guide. Never fails the page: if the API is
 * unreachable (e.g. during a build), returns an empty list cached briefly.
 */
export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  "use cache";
  cacheTag("catalog");
  try {
    const { categories } = await publicGet<CatalogCategoryList>(
      "/catalog/categories",
    );
    cacheLife("minutes");
    return categories;
  } catch {
    cacheLife("seconds");
    return [];
  }
}
