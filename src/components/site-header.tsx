import Image from "next/image";
import Link from "next/link";

import type { PostCategory } from "@/domain/post";

import { CategoryFilter } from "./category-filter";
import { NewsletterForm } from "./newsletter-form";

export function SiteHeader({ category }: { category?: PostCategory }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#efefef] bg-white/95 backdrop-blur-md">
      <div className="relative flex h-[60px] items-center justify-center">
        <Link href="/" aria-label="n inspiration home" className="focus-ring rounded-lg">
          <Image
            src="/brand/n-mark.png"
            alt="n"
            width={52}
            height={52}
            priority
            className="size-[52px] object-contain"
          />
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3 px-3 pb-3 sm:px-5">
        <CategoryFilter current={category} />
        <div className="hidden shrink-0 sm:block">
          <NewsletterForm compact />
        </div>
      </div>
    </header>
  );
}
