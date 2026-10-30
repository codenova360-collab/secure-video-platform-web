/** Where a product lives on the site. */
export function productHref(product: {
  type: "VIDEO" | "BUNDLE" | "PLAN";
  slug: string | null;
}): string {
  if (!product.slug) return "/";
  if (product.type === "VIDEO") return `/watch/${product.slug}`;
  if (product.type === "BUNDLE") return `/bundles/${product.slug}`;
  return "/plans";
}

export const PRODUCT_LABEL = {
  VIDEO: "Video",
  BUNDLE: "Bundle",
  PLAN: "Pass",
} as const;
