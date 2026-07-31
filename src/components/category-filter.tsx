import Link from "next/link";

import { POST_CATEGORIES, type PostCategory } from "@/domain/post";

export function CategoryFilter({ current }: { current?: PostCategory }) {
  const categories = ["All", ...POST_CATEGORIES] as const;

  return (
    <nav
      aria-label="Filter posts by category"
      className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((category) => {
        const active = category === "All" ? !current : current === category;
        const href = category === "All" ? "/" : `/?category=${encodeURIComponent(category)}`;

        return (
          <Link
            key={category}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring inline-flex h-7 shrink-0 items-center rounded-full px-3 text-[13px] leading-none transition-colors ${
              active
                ? "bg-black text-white"
                : "bg-[#f0f0f0] text-[#727272] hover:bg-[#e4e4e4] hover:text-[#444]"
            }`}
          >
            {category}
          </Link>
        );
      })}
    </nav>
  );
}
