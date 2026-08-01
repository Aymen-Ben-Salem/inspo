import Image from "next/image";
import Link from "next/link";

import type { PostCategory } from "@/domain/post";

import { CategoryFilter } from "./category-filter";
import { CollapsingHeader } from "./collapsing-header";
import { NewsletterForm } from "./newsletter-form";

export function SiteHeader({ category }: { category?: PostCategory }) {
  return (
    <CollapsingHeader>
      <Link href="/" aria-label="n inspiration home" className="focus-ring rounded-lg">
        <Image
          src="/brand/n-mark.png"
          alt="n"
          width={45}
          height={41}
          priority
          className="h-[41px] w-[45px] object-cover"
        />
      </Link>
      <CategoryFilter current={category} />
      <div className="hidden w-[335px] shrink-0 xl:block">
        <NewsletterForm compact />
      </div>
    </CollapsingHeader>
  );
}
