import Image from "next/image";

import type { Post } from "@/domain/post";

import { DetailMotion } from "./detail-motion";

export function PostGallery({ post }: { post: Post }) {
  return (
    <DetailMotion>
      {post.media.map((media) => (
        <figure
          key={media.id}
          data-detail-media
          className="relative flex min-h-[68dvh] w-full shrink-0 snap-center items-center justify-center overflow-hidden rounded-[12px]"
        >
          {media.type === "video" ? (
            <video
              src={media.url}
              poster={media.posterUrl}
              controls
              playsInline
              preload="metadata"
              className="max-h-[calc(100dvh-142px)] max-w-full rounded-[12px] object-contain shadow-2xl"
            >
              <track kind="captions" />
            </video>
          ) : (
            <Image
              src={media.url}
              alt={media.alt}
              width={media.width}
              height={media.height}
              sizes="(min-width: 1024px) calc(100vw - 420px), 100vw"
              priority={media.position === 0}
              className="max-h-[calc(100dvh-142px)] w-auto max-w-full rounded-[12px] object-contain shadow-2xl"
            />
          )}
        </figure>
      ))}
    </DetailMotion>
  );
}
