"use client";

import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
} from "react";

type LoopingVideoProps = Omit<
  ComponentPropsWithoutRef<"video">,
  "autoPlay" | "controls" | "loop" | "muted" | "playsInline"
> & {
  eager?: boolean;
};

function playSilently(video: HTMLVideoElement) {
  void video.play().catch(() => {
    // The poster remains visible if a browser or device declines autoplay.
  });
}

export function LoopingVideo({
  eager = false,
  preload,
  ...props
}: LoopingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (eager || !("IntersectionObserver" in window)) {
      playSilently(video);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          playSilently(video);
          return;
        }

        video.pause();
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [eager]);

  return (
    <video
      ref={videoRef}
      {...props}
      autoPlay={eager}
      controls={false}
      loop
      muted
      playsInline
      preload={preload ?? (eager ? "metadata" : "none")}
    />
  );
}
