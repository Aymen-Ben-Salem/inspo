import Image from "next/image";
import Link from "next/link";

import type { PostCategory } from "@/domain/post";

import { CategoryFilter } from "./category-filter";
import { NewsletterForm } from "./newsletter-form";

export function SiteHeader({ category }: { category?: PostCategory }) {
  return (
    <header className="relative z-40 bg-white">
      <div className="mx-auto flex max-w-[1705px] items-center gap-5 px-4 pb-5 pt-10 sm:px-5 2xl:px-11">
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
      </div>
    </header>
  );
}
