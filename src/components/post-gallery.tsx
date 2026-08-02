import Image from "next/image";

import { isGifUrl, type Post } from "@/domain/post";

import { DetailMotion } from "./detail-motion";

export function PostGallery({ post, overlay = false }: { post: Post; overlay?: boolean }) {
  return (
    <DetailMotion overlay={overlay}>
      {post.media.map((media) => {
        const emphasizePortraitScale =
          overlay && media.height / media.width >= 1.15;
        const mediaSize = emphasizePortraitScale
          ? "max-h-[85dvh] lg:h-[85dvh]"
          : "max-h-[79.2dvh] lg:h-[79.2dvh]";

        return (
          <figure
            key={media.id}
            data-detail-media
            className="flex h-full min-w-full snap-center items-center justify-center px-4 py-10 lg:py-0"
          >
            {media.type === "video" ? (
              <video
                data-post-dialog-surface={overlay ? "" : undefined}
                data-post-dialog-hero={overlay && media.position === 0 ? "" : undefined}
                data-post-dialog-emphasize-scale={
                  emphasizePortraitScale ? "" : undefined
                }
                src={media.url}
                poster={media.posterUrl}
                controls
                playsInline
                preload="metadata"
                className={`h-auto max-w-full rounded-[10px] object-cover lg:w-auto ${mediaSize} ${
                  overlay ? "shadow-[0_18px_60px_rgba(0,0,0,0.12)]" : ""
                }`}
              >
                <track kind="captions" />
              </video>
            ) : (
              <Image
                data-post-dialog-surface={overlay ? "" : undefined}
                data-post-dialog-hero={overlay && media.position === 0 ? "" : undefined}
                data-post-dialog-emphasize-scale={
                  emphasizePortraitScale ? "" : undefined
                }
                src={media.url}
                alt={media.alt}
                width={media.width}
                height={media.height}
                unoptimized={isGifUrl(media.url)}
                sizes="(min-width: 1024px) 48vw, 90vw"
                priority={media.position === 0}
                className={`h-auto max-w-full rounded-[10px] object-cover lg:w-auto ${mediaSize} ${
                  overlay ? "shadow-[0_18px_60px_rgba(0,0,0,0.12)]" : ""
                }`}
              />
            )}
          </figure>
        );
      })}
    </DetailMotion>
  );
}
