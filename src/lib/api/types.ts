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
export type CatalogBundle = Schemas["CatalogBundleDto"];
export type CatalogBundleList = Schemas["CatalogBundleListDto"];
export type CatalogBundleDetail = Schemas["CatalogBundleDetailDto"];
export type CatalogBundleDetailResponse =
  Schemas["CatalogBundleDetailResponseDto"];
export type CatalogPlan = Schemas["CatalogPlanDto"];
export type CatalogPlanList = Schemas["CatalogPlanListDto"];
export type VideoAccess = Schemas["VideoAccessDto"];
export type Order = Schemas["OrderDto"];
export type OrderResponse = Schemas["OrderResponseDto"];
export type OrderList = Schemas["OrderListDto"];
export type PayOrderResponse = Schemas["PayOrderResponseDto"];
export type PaymentVerifyResponse = Schemas["PaymentVerifyResponseDto"];
export type LibraryItem = Schemas["LibraryItemDto"];
export type Library = Schemas["LibraryDto"];
export type CustomerSubscription = Schemas["SubscriptionDto"];
export type SubscriptionList = Schemas["SubscriptionListDto"];
export type SubscriptionResponse = Schemas["SubscriptionResponseDto"];
export type CardUpdateLink = Schemas["CardUpdateLinkDto"];
export type PlaybackResponse = Schemas["PlaybackResponseDto"];
export type PlaybackHeartbeat = Schemas["PlaybackHeartbeatDto"];
export type PlaybackSource = Schemas["PlaybackSourceDto"];
