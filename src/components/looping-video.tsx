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
  video.controls = false;
  video.defaultMuted = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  void video.play().catch(() => {
    // The poster remains visible if a browser or device declines autoplay.
  });
}

export function resumeLoopingVideos(root: ParentNode) {
  root
    .querySelectorAll<HTMLVideoElement>("[data-looping-video]")
    .forEach(playSilently);
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
      data-looping-video
      autoPlay={eager}
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      loop
      muted
      playsInline
      preload={preload ?? (eager ? "auto" : "none")}
    />
  );
}
