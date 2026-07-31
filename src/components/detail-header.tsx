import Image from "next/image";
import Link from "next/link";

import { NewsletterForm } from "./newsletter-form";

export function DetailHeader() {
  return (
    <header className="sticky top-0 z-40 grid h-[61px] grid-cols-[1fr_auto_1fr] items-center border-b border-[#efefef] bg-white/95 px-3 backdrop-blur-md sm:px-5">
      <Link href="/" className="focus-ring w-fit rounded-full px-2 py-1 text-[13px] text-[#666] hover:text-black">
        Back
      </Link>
      <Link href="/" aria-label="n inspiration home" className="focus-ring rounded-lg">
        <Image
          src="/brand/n-mark.png"
          alt="n"
          width={44}
          height={44}
          priority
          className="size-11 object-contain"
        />
      </Link>
      <div className="hidden justify-self-end md:block">
        <NewsletterForm compact />
      </div>
    </header>
  );
}
