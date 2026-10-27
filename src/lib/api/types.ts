import type { components } from "./schema";

/** Response/request shapes generated from the API's OpenAPI document. */
export type Schemas = components["schemas"];

export type Customer = Schemas["CustomerDto"];
export type CustomerResponse = Schemas["CustomerResponseDto"];
export type Session = Schemas["SessionDto"];
export type SessionList = Schemas["SessionListDto"];

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: { field?: string; messages: string[] }[];
  };
}

export type CatalogVideo = Schemas["CatalogVideoDto"];
export type CatalogVideoList = Schemas["CatalogVideoListDto"];
export type CatalogVideoDetail = Schemas["CatalogVideoDetailDto"];
export type CatalogVideoDetailResponse =
  Schemas["CatalogVideoDetailResponseDto"];
export type CatalogCategory = Schemas["CatalogCategoryDto"];
export type CatalogCategoryList = Schemas["CatalogCategoryListDto"];
