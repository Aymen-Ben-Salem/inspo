import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import type { Post } from "@/domain/post";

import { NewsletterForm } from "./newsletter-form";
import { PostCloseButton } from "./post-close-button";
import type { PostDialogCloseMode } from "./post-dialog";

type AdjacentPost = Pick<Post, "slug" | "title">;

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 27 27"
      aria-hidden="true"
      className={`size-[27px] ${direction === "right" ? "rotate-180" : ""}`}
      fill="none"
    >
      <path d="M22 13.5H5m0 0 7-7m-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CircleLink({
  href,
  label,
  children,
  replace = false,
}: {
  href: Route;
  label: string;
  children: ReactNode;
  replace?: boolean;
}) {
  return (
    <Link
      href={href}
      replace={replace}
      aria-label={label}
      className="focus-ring flex size-10 items-center justify-center rounded-full border border-[#e6e6e6] bg-[#e6e6e6] text-[#95959d] transition-colors hover:bg-[#dcdcdc] hover:text-[#505050]"
    >
      {children}
    </Link>
  );
}

export function PostMetadata({
  post,
  previousPost,
  nextPost,
  closeMode,
  overlay = false,
}: {
  post: Post;
  previousPost: AdjacentPost;
  nextPost: AdjacentPost;
  closeMode?: PostDialogCloseMode;
  overlay?: boolean;
}) {
  return (
    <aside
      data-post-dialog-surface={overlay ? "" : undefined}
      data-post-dialog-sidebar={overlay ? "" : undefined}
      className={`flex w-full shrink-0 flex-col border-l border-[#e5e7eb] bg-white ${
        overlay
          ? "min-h-fit lg:h-[100dvh] lg:w-[clamp(300px,29.25vw,522px)]"
          : "order-first min-h-[100dvh] lg:order-last lg:h-[100dvh] lg:w-[522px]"
      }`}
    >
      <div
        className={`flex min-h-full flex-1 flex-col px-5 pb-8 pt-7 lg:pb-7 ${
          overlay ? "lg:px-[34px]" : "sm:px-[47px]"
        }`}
      >
        <nav className="flex h-10 items-center justify-between" aria-label="Post navigation">
          {closeMode ? (
            <PostCloseButton closeMode={closeMode}>
              <CloseIcon />
            </PostCloseButton>
          ) : (
            <CircleLink href="/" label="Close post">
              <CloseIcon />
            </CircleLink>
          )}
          <div className="flex items-center gap-5">
            <CircleLink
              href={`/posts/${previousPost.slug}` as Route}
              label={`Previous post: ${previousPost.title}`}
              replace={overlay}
            >
              <ArrowIcon direction="left" />
            </CircleLink>
            <CircleLink
              href={`/posts/${nextPost.slug}` as Route}
              label={`Next post: ${nextPost.title}`}
              replace={overlay}
            >
              <ArrowIcon direction="right" />
            </CircleLink>
          </div>
        </nav>

        <div className="mt-[30px] flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-start gap-[10px]">
              <span className="inline-flex h-[29px] items-center rounded-full bg-[#f0f0f0] px-3 text-[14px] tracking-[0.2px] text-[#7b7b7b]">
                {post.category}
              </span>
              <div>
                <h1 className="text-[22px] font-medium leading-normal tracking-[0.044px] text-black">
                  {post.title}
                </h1>
                <div className="mt-2 flex h-[30px] items-center gap-[7px] text-[16px] tracking-[0.032px] text-[rgba(88,88,88,0.8)]">
                  <Image
                    src={post.creatorAvatarUrl}
                    alt=""
                    width={25}
                    height={25}
                    className="size-[25px] rounded-full object-cover"
                  />
                  <span>{post.creatorName}</span>
                </div>
              </div>
            </div>

            <p className="max-w-[429px] text-[18px] leading-[1.3] tracking-[0.036px] text-[#505050]">
              {post.description}
            </p>
          </div>

          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex h-[42px] w-full items-center justify-center rounded-full bg-[#262626] px-[14px] text-[18px] font-medium leading-normal tracking-[0.036px] text-white transition-colors hover:bg-black"
          >
            View original
          </a>
        </div>

        <div className="mt-auto flex flex-col items-center gap-[10px] pt-16">
          <NewsletterForm />
          <p className="text-center text-[12px] leading-[1.3] tracking-[-0.024px] text-[#95959d]">
            <span className="text-[#505050]">Subscribe</span> to a weekly email
          </p>
        </div>
      </div>
    </aside>
  );
}
