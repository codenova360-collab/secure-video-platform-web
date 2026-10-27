import Link from "next/link";
import { getCatalogCategories } from "@/lib/api/catalog";
import { CategoryAvatar } from "../catalog/video-thumbnail";

/** Guide "Categories" section (YouTube lists subscribed channels here). */
export async function GuideCategories() {
  const categories = await getCatalogCategories();
  if (categories.length === 0) return null;
  return (
    <div className="border-b border-divider px-3 py-3">
      <h2 className="px-3 pt-1 pb-1 text-base font-medium">Categories</h2>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/?category=${category.slug}`}
          className="flex h-10 items-center gap-6 rounded-lg px-3 text-sm hover:bg-surface"
        >
          <CategoryAvatar name={category.name} size={24} />
          <span className="truncate">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
