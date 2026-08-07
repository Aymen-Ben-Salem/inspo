import Link from "next/link";

import type { PostCategory, PostView } from "@/domain/post";

import { BrandMark } from "./brand-mark";
import { CategoryFilter } from "./category-filter";
import { NewsletterForm } from "./newsletter-form";
import { StickyHeader } from "./sticky-header";
import { ViewFilter } from "./view-filter";

export function SiteHeader({
  category,
  view,
}: {
  category?: PostCategory;
  view: PostView;
}) {
  return (
    <StickyHeader>
      <Link href="/" aria-label="n inspiration home" className="focus-ring rounded-lg">
        <BrandMark priority responsive />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <CategoryFilter current={category} view={view} />
        <ViewFilter category={category} view={view} />
      </div>
      <div className="hidden w-[344px] shrink-0 xl:block 2xl:w-[356px] min-[1700px]:w-[369px]">
        <NewsletterForm compact />
      </div>
    </StickyHeader>
  );
}
