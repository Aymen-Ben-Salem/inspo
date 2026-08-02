import Image from "next/image";

import { isGifUrl, type Post } from "@/domain/post";

import { DetailMotion } from "./detail-motion";
import { LoopingVideo } from "./looping-video";

export function PostGallery({ post, overlay = false }: { post: Post; overlay?: boolean }) {
  return (
    <DetailMotion overlay={overlay}>
      {post.media.map((media) => {
        const isPortrait = media.height / media.width >= 1.15;
        const maxViewportHeight = overlay && isPortrait ? 85 : 79.2;
        const aspectRatio = media.width / media.height;
        const maxViewportWidth = maxViewportHeight * aspectRatio;
        const isAnimated = media.type === "video" || isGifUrl(media.url);

        return (
          <figure
            key={media.id}
            data-detail-media
            className="flex h-full min-w-full snap-center items-center justify-center px-4 py-10 lg:py-0"
          >
            <div
              data-post-dialog-surface={overlay ? "" : undefined}
              data-post-dialog-hero={overlay && media.position === 0 ? "" : undefined}
              data-post-dialog-animated-media={isAnimated ? "" : undefined}
              className={`relative shrink-0 overflow-hidden rounded-[10px] bg-[#f3f3f3] ${
                overlay ? "shadow-[0_18px_60px_rgba(0,0,0,0.12)]" : ""
              }`}
              style={{
                aspectRatio: `${media.width} / ${media.height}`,
                width: `min(100%, ${maxViewportWidth}dvh)`,
              }}
            >
              {media.type === "video" ? (
                <LoopingVideo
                  src={media.url}
                  poster={media.posterUrl}
                  aria-label={media.alt}
                  draggable={false}
                  eager
                  width={media.width}
                  height={media.height}
                  className="size-full object-cover"
                />
              ) : (
                <Image
                  src={media.url}
                  alt={media.alt}
                  fill
                  unoptimized={isGifUrl(media.url)}
                  sizes="(min-width: 1024px) 48vw, 90vw"
                  priority={media.position === 0}
                  className="object-cover"
                />
              )}
            </div>
          </figure>
        );
      })}
    </DetailMotion>
  );
}
