import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { serverEnv } from "../env.server";
import { ApiError } from "./errors";
import type {
  CatalogBundle,
  CatalogBundleDetail,
  CatalogBundleDetailResponse,
  CatalogBundleList,
  CatalogCategory,
  CatalogCategoryList,
  CatalogPlan,
  CatalogPlanList,
  CatalogVideoDetailResponse,
  CatalogVideoList,
} from "./types";

/**
 * Public catalog reads. The data is the same for every visitor, so it's
 * cached on the server for a few minutes (`use cache`) and never carries a
 * visitor's cookies. Each exported reader waits for a request first
 * (`connection()`), so builds never call the API and the catalog is always
 * filled at runtime from the cache. Errors aren't cached.
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

async function cachedGet<T>(path: string): Promise<T> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return publicGet<T>(path);
}

export async function getCatalogVideos(
  query: CatalogQuery,
): Promise<CatalogVideoList> {
  await connection();
  return cachedGet<CatalogVideoList>(`/catalog/videos${toSearch(query)}`);
}

/** Null when the video doesn't exist or isn't published. */
export async function getCatalogVideo(
  slug: string,
): Promise<CatalogVideoDetailResponse | null> {
  await connection();
  try {
    return await cachedGet<CatalogVideoDetailResponse>(
      `/catalog/videos/${encodeURIComponent(slug)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Categories for the chip bar and guide. Never fails the page: if the API is
 * unreachable, returns an empty list (and tries again on the next request).
 */
export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  await connection();
  try {
    const { categories } = await cachedGet<CatalogCategoryList>(
      "/catalog/categories",
    );
    return categories;
  } catch {
    return [];
  }
}

/** Published bundles; empty (not an error page) if the API is unreachable. */
export async function getCatalogBundles(): Promise<CatalogBundle[]> {
  await connection();
  try {
    return (await cachedGet<CatalogBundleList>("/catalog/bundles")).bundles;
  } catch {
    return [];
  }
}

/** Null when the bundle doesn't exist or isn't published. */
export async function getCatalogBundle(
  slug: string,
): Promise<CatalogBundleDetail | null> {
  await connection();
  try {
    return (
      await cachedGet<CatalogBundleDetailResponse>(
        `/catalog/bundles/${encodeURIComponent(slug)}`,
      )
    ).bundle;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Published access plans; empty if the API is unreachable. */
export async function getCatalogPlans(): Promise<CatalogPlan[]> {
  await connection();
  try {
    return (await cachedGet<CatalogPlanList>("/catalog/plans")).plans;
  } catch {
    return [];
  }
}
