import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

import type { Post } from "@/domain/post";

export function PostCard({ post }: { post: Post }) {
  const cover = post.media[0];

  if (!cover) return null;

  return (
    <article data-feed-card className="mb-3 break-inside-avoid opacity-0">
      <Link
        href={`/posts/${post.slug}` as Route}
        aria-label={`View post: ${post.title}`}
        className="focus-ring group relative block overflow-hidden rounded-[10px] bg-[#f3f3f3]"
        style={{ aspectRatio: `${cover.width}/${cover.height}` }}
      >
        <Image
          src={cover.posterUrl ?? cover.url}
          alt={cover.alt}
          fill
          sizes="(min-width: 1540px) 20vw, (min-width: 1120px) 25vw, (min-width: 760px) 33vw, (min-width: 460px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-40 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute inset-x-3 bottom-3 z-10 flex items-end gap-2">
          <Image
            src={post.creatorAvatarUrl}
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
          />
          <span className="min-w-0 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <span className="block truncate text-[13px] font-medium leading-tight text-white">
              {post.title}
            </span>
            <span className="block truncate text-[11px] leading-tight text-white/75">
              {post.creatorName}
            </span>
          </span>
        </span>
        {post.media.length > 1 ? (
          <span className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-black/35 text-xs text-white shadow-sm backdrop-blur-md">
            <span className="sr-only">{post.media.length} slides</span>
            <span aria-hidden="true">{post.media.length}</span>
          </span>
        ) : null}
        <span className="pointer-events-none absolute inset-0 rounded-[10px] border border-black/10" />
      </Link>
    </article>
  );
}
