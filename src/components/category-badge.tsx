import { CATEGORY_LABEL, CATEGORY_STYLE, type Category } from "@/lib/categories";

export function CategoryBadge({ category }: { category: Category }) {
  const style = CATEGORY_STYLE[category];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}
