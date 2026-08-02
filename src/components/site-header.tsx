import Link from "next/link";

import type { PostCategory } from "@/domain/post";

import { BrandMark } from "./brand-mark";
import { CategoryFilter } from "./category-filter";
import { NewsletterForm } from "./newsletter-form";
import { StickyHeader } from "./sticky-header";

export function SiteHeader({ category }: { category?: PostCategory }) {
  return (
    <StickyHeader>
      <Link href="/" aria-label="n inspiration home" className="focus-ring rounded-lg">
        <BrandMark priority responsive />
      </Link>
      <CategoryFilter current={category} />
      <div className="hidden w-[344px] shrink-0 xl:block 2xl:w-[356px] min-[1700px]:w-[369px]">
        <NewsletterForm compact />
      </div>
    </StickyHeader>
  );
}
