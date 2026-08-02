"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type MouseEvent, type PropsWithChildren, useRef } from "react";

import { stagePostTransition } from "./post-transition-state";

gsap.registerPlugin(useGSAP);

export function FeedMotion({ children }: PropsWithChildren) {
  const scope = useRef<HTMLDivElement>(null);

  function handlePostClick(event: MouseEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target;
    const postLink =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-feed-post-id]")
        : null;
    const postId = postLink?.dataset.feedPostId;

    if (postId) stagePostTransition(postId);
  }

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        "[data-feed-card]",
        { autoAlpha: 0, y: 14, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.035,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        },
      );
    },
    { scope },
  );

  return (
    <div ref={scope} onClickCapture={handlePostClick}>
      {children}
    </div>
  );
}
