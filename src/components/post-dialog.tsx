"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { consumePostTransition } from "./post-transition-state";

gsap.registerPlugin(useGSAP);

export type PostDialogCloseMode = "back" | "home";

export function PostDialog({
  children,
  closeMode,
  postId,
}: PropsWithChildren<{ closeMode: PostDialogCloseMode; postId: string }>) {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    if (closeMode === "back") {
      router.back();
      return;
    }

    router.push("/");
  }, [closeMode, router]);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close]);

  useGSAP(
    () => {
      const root = scope.current;

      if (!root) return;

      const backdrop = root.querySelector<HTMLElement>("[data-post-dialog-backdrop]");
      const sidebar = root.querySelector<HTMLElement>("[data-post-dialog-sidebar]");
      const hero = root.querySelector<HTMLElement>("[data-post-dialog-hero]");
      const shouldAnimateFromFeed =
        closeMode === "back" && consumePostTransition(postId);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!backdrop || !sidebar || !hero || reducedMotion || !shouldAnimateFromFeed) {
        gsap.set([backdrop, sidebar, hero].filter(Boolean), {
          clearProps: "all",
        });
        return;
      }

      const source = Array.from(
        document.querySelectorAll<HTMLElement>("[data-feed-post-id]"),
      ).find((candidate) => candidate.dataset.feedPostId === postId);
      const sourceRect = source?.getBoundingClientRect();
      const targetRect = hero.getBoundingClientRect();
      const sourceIsVisible = Boolean(
        sourceRect &&
          sourceRect.bottom > 0 &&
          sourceRect.right > 0 &&
          sourceRect.top < window.innerHeight &&
          sourceRect.left < window.innerWidth,
      );
      const timeline = gsap.timeline({
        defaults: { duration: 0.56, ease: "back.out(1.08)" },
      });

      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(sidebar, { xPercent: 100, willChange: "transform" });

      timeline.to(
        backdrop,
        { autoAlpha: 1, duration: 0.22, ease: "power2.out" },
        0,
      );
      timeline.to(
        sidebar,
        { xPercent: 0, clearProps: "transform,willChange" },
        0,
      );

      if (source && sourceRect && sourceIsVisible && targetRect.width > 0) {
        gsap.set(source, { visibility: "hidden" });
        gsap.set(hero, {
          x: sourceRect.left - targetRect.left,
          y: sourceRect.top - targetRect.top,
          scaleX: sourceRect.width / targetRect.width,
          scaleY: sourceRect.height / targetRect.height,
          transformOrigin: "top left",
          willChange: "transform",
        });
        timeline.to(
          hero,
          {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            clearProps: "transform,transformOrigin,willChange",
          },
          0,
        );
        return;
      }

      timeline.fromTo(
        hero,
        { autoAlpha: 0, scale: 0.96 },
        {
          autoAlpha: 1,
          scale: 1,
          clearProps: "transform,opacity,visibility",
        },
        0,
      );
    },
    {
      scope,
      dependencies: [closeMode, postId],
      revertOnUpdate: true,
    },
  );

  function handleDialogClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest("[data-post-dialog-surface]")) {
      return;
    }

    close();
  }

  return (
    <div
      ref={scope}
      role="dialog"
      aria-modal="true"
      aria-label="Post details"
      onClick={handleDialogClick}
      className="fixed inset-0 z-50 isolate"
    >
      <div
        data-post-dialog-backdrop
        aria-hidden="true"
        className="absolute inset-0 bg-white/10 backdrop-blur-[3px]"
      />
      <div className="pointer-events-none relative h-full">{children}</div>
    </div>
  );
}
