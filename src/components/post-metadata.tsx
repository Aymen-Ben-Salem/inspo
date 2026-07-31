import Image from "next/image";

import type { Post } from "@/domain/post";

import { NewsletterForm } from "./newsletter-form";

function MetadataRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex items-start justify-between gap-5 border-t border-black/10 py-2 first:border-t-0">
      <dt className="shrink-0 text-[13px] text-black/40">{label}</dt>
      <dd className="flex min-w-0 flex-col items-end gap-1 text-right text-[13px] text-[#3b3b3b]">
        {values.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </dd>
    </div>
  );
}

export function PostMetadata({ post }: { post: Post }) {
  return (
    <aside className="order-2 w-full shrink-0 bg-white lg:order-first lg:h-full lg:w-[320px] lg:overflow-y-auto lg:border-r lg:border-black/10">
      <div className="flex min-h-full flex-col gap-8 px-5 py-6 lg:px-6 lg:py-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[15px] font-medium text-black/40">{post.category}</p>
            <h1 className="text-[22px] font-medium leading-snug tracking-[-0.01em] text-black">
              {post.title}
            </h1>
          </div>

          {post.creatorUrl ? (
            <a
              href={post.creatorUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring flex w-fit min-w-0 items-center gap-2 rounded-full text-[13px] text-[#3b3b3b] hover:text-black/65"
            >
              <Image
                src={post.creatorAvatarUrl}
                alt=""
                width={22}
                height={22}
                className="size-[22px] rounded-full object-cover"
              />
              <span className="truncate">{post.creatorName}</span>
            </a>
          ) : (
            <div className="flex min-w-0 items-center gap-2 text-[13px] text-[#3b3b3b]">
              <Image
                src={post.creatorAvatarUrl}
                alt=""
                width={22}
                height={22}
                className="size-[22px] rounded-full object-cover"
              />
              <span className="truncate">{post.creatorName}</span>
            </div>
          )}

          <p className="text-[13px] leading-[1.55] text-pretty text-[#3b3b3b]">
            {post.description}
          </p>
        </div>

        <dl className="flex w-full flex-col">
          <MetadataRow label="Category" values={[post.category]} />
          <MetadataRow label="Industry" values={post.industries} />
          <MetadataRow label="Style" values={post.styles} />
          <MetadataRow label="Color" values={post.colors} />
          <MetadataRow label="Media" values={[`${post.media.length} ${post.media.length === 1 ? "slide" : "slides"}`]} />
        </dl>

        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#222]"
        >
          View original
          <span aria-hidden="true" className="ml-1.5">
            ↗
          </span>
        </a>

        <div className="mt-auto border-t border-[#efefef] pt-6">
          <NewsletterForm />
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#686868]">
            A quiet weekly digest of newly added work.
          </p>
        </div>
      </div>
    </aside>
  );
}
