import Link from "next/link";

import type { PostCategory } from "@/domain/post";

import { BrandMark } from "./brand-mark";
import { CategoryFilter } from "./category-filter";
import { CollapsingHeader } from "./collapsing-header";
import { NewsletterForm } from "./newsletter-form";

export function SiteHeader({ category }: { category?: PostCategory }) {
  return (
    <CollapsingHeader>
      <Link href="/" aria-label="n inspiration home" className="focus-ring rounded-lg">
        <BrandMark priority />
      </Link>
      <CategoryFilter current={category} />
      <div className="hidden w-[335px] shrink-0 xl:block">
        <NewsletterForm compact />
      </div>
    </CollapsingHeader>
  );
}
