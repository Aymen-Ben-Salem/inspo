"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import {
  createContext,
  type MouseEvent,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

gsap.registerPlugin(useGSAP);

export type PostDialogCloseMode = "back" | "home";

const POST_ENTRANCE_DURATION = 0.46;
const POST_EXIT_DURATION = 0.42;
const SIDEBAR_ENTRANCE_DURATION = POST_ENTRANCE_DURATION;
const SIDEBAR_EXIT_DURATION = 0.28;
const SIDEBAR_ENTRANCE_DELAY = 0;
const POST_EXIT_DELAY = 0.07;
const EXIT_DURATION = POST_EXIT_DELAY + POST_EXIT_DURATION;

const PostDialogCloseContext = createContext<(() => void) | undefined>(undefined);

export function usePostDialogClose() {
  return useContext(PostDialogCloseContext);
}

function findFeedPost(postId: string | undefined) {
  if (!postId) return undefined;

  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-feed-post-id]"),
  ).find((candidate) => candidate.dataset.feedPostId === postId);
}

function isVisible(rect: DOMRect | undefined) {
  return Boolean(
    rect &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth,
  );
}

function getOtherGalleryItems(gallery: HTMLElement, hero: HTMLElement) {
  return Array.from(
    gallery.querySelectorAll<HTMLElement>("[data-detail-media]"),
  ).filter((item) => !item.contains(hero));
}

function prepareGalleryForTransition(
  gallery: HTMLElement,
  hero: HTMLElement,
) {
  gsap.set(gallery, {
    overflow: "visible",
    position: "relative",
    zIndex: 2,
  });
  gsap.set(getOtherGalleryItems(gallery, hero), { visibility: "hidden" });
}

function restoreGalleryAfterTransition(
  gallery: HTMLElement,
  hero: HTMLElement,
) {
  gsap.set(gallery, { clearProps: "overflow,position,zIndex" });
  gsap.set(getOtherGalleryItems(gallery, hero), { clearProps: "visibility" });
}

export function PostDialog({
  children,
  closeMode,
}: PropsWithChildren<{ closeMode: PostDialogCloseMode }>) {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);
  const entrance = useRef<gsap.core.Timeline>(null);
  const entranceHero = useRef<HTMLElement>(null);
  const entranceHeroRect = useRef<DOMRect>(null);
  const closing = useRef(false);

  const finishClose = useCallback(() => {
    if (closeMode === "back") {
      router.back();
      return;
    }

    router.push("/");
  }, [closeMode, router]);

  const requestClose = useCallback(() => {
    if (closing.current) return;

    const root = scope.current;

    if (!root) {
      finishClose();
      return;
    }

    closing.current = true;
    entrance.current?.kill();

    const backdrop = root.querySelector<HTMLElement>("[data-post-dialog-backdrop]");
    const gallery = root.querySelector<HTMLElement>("[data-post-dialog-gallery]");
    const sidebar = root.querySelector<HTMLElement>("[data-post-dialog-sidebar]");
    const hero = root.querySelector<HTMLElement>("[data-post-dialog-hero]");
    const postId = root.querySelector<HTMLElement>("[data-post-dialog-post-id]")
      ?.dataset.postDialogPostId;
    const source = findFeedPost(postId);
    const sourceRect = source?.getBoundingClientRect();
    const finalHeroRect =
      hero === entranceHero.current && entranceHeroRect.current
        ? entranceHeroRect.current
        : hero?.getBoundingClientRect();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      reducedMotion ||
      !backdrop ||
      !gallery ||
      !sidebar ||
      !hero ||
      !finalHeroRect
    ) {
      finishClose();
      return;
    }

    gsap.set(root, { pointerEvents: "none" });
    prepareGalleryForTransition(gallery, hero);

    const timeline = gsap.timeline({ onComplete: finishClose });

    timeline.to(
      backdrop,
      { autoAlpha: 0, duration: 0.24, ease: "power2.in" },
      EXIT_DURATION - 0.24,
    );
    timeline.to(
      sidebar,
      {
        xPercent: 100,
        duration: SIDEBAR_EXIT_DURATION,
        ease: "power3.out",
      },
      0,
    );

    if (sourceRect && isVisible(sourceRect) && finalHeroRect.width > 0) {
      timeline.to(
        hero,
        {
          x: sourceRect.left - finalHeroRect.left,
          y: sourceRect.top - finalHeroRect.top,
          scaleX: sourceRect.width / finalHeroRect.width,
          scaleY: sourceRect.height / finalHeroRect.height,
          transformOrigin: "top left",
          duration: POST_EXIT_DURATION,
          ease: "power3.inOut",
        },
        POST_EXIT_DELAY,
      );
      return;
    }

    timeline.to(
      hero,
      {
        autoAlpha: 0,
        scale: 0.96,
        duration: POST_EXIT_DURATION,
        ease: "power2.in",
      },
      POST_EXIT_DELAY,
    );
  }, [finishClose]);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestClose]);

  useGSAP(
    () => {
      const root = scope.current;

      if (!root || closeMode !== "back") return;

      let observer: MutationObserver | undefined;

      const startEntrance = () => {
        const backdrop = root.querySelector<HTMLElement>(
          "[data-post-dialog-backdrop]",
        );
        const gallery = root.querySelector<HTMLElement>(
          "[data-post-dialog-gallery]",
        );
        const sidebar = root.querySelector<HTMLElement>(
          "[data-post-dialog-sidebar]",
        );
        const hero = root.querySelector<HTMLElement>("[data-post-dialog-hero]");
        const postId = root.querySelector<HTMLElement>(
          "[data-post-dialog-post-id]",
        )?.dataset.postDialogPostId;

        if (!backdrop || !gallery || !sidebar || !hero || !postId) return false;

        const targetRect = hero.getBoundingClientRect();
        const sourceRect = findFeedPost(postId)?.getBoundingClientRect();
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        entranceHero.current = hero;
        entranceHeroRect.current = targetRect;

        if (reducedMotion) {
          gsap.set([backdrop, gallery, sidebar, hero], { clearProps: "all" });
          return true;
        }

        const timeline = gsap.timeline({
          onComplete: () => restoreGalleryAfterTransition(gallery, hero),
        });

        entrance.current = timeline;
        prepareGalleryForTransition(gallery, hero);
        gsap.set(backdrop, { autoAlpha: 0 });
        gsap.set(sidebar, { xPercent: 100, willChange: "transform" });

        timeline.to(
          backdrop,
          { autoAlpha: 1, duration: 0.22, ease: "power2.out" },
          0,
        );
        timeline.to(
          sidebar,
          {
            xPercent: 0,
            duration: SIDEBAR_ENTRANCE_DURATION,
            ease: "back.out(1.08)",
            clearProps: "transform,willChange",
          },
          SIDEBAR_ENTRANCE_DELAY,
        );

        if (sourceRect && isVisible(sourceRect) && targetRect.width > 0) {
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
              duration: POST_ENTRANCE_DURATION,
              ease: "back.out(1.08)",
              clearProps: "transform,transformOrigin,willChange",
            },
            0,
          );
          return true;
        }

        timeline.fromTo(
          hero,
          { autoAlpha: 0, scale: 0.96 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: POST_ENTRANCE_DURATION,
            ease: "back.out(1.08)",
            clearProps: "transform,opacity,visibility",
          },
          0,
        );
        return true;
      };

      if (!startEntrance()) {
        observer = new MutationObserver(() => {
          if (startEntrance()) observer?.disconnect();
        });
        observer.observe(root, { childList: true, subtree: true });
      }

      return () => observer?.disconnect();
    },
    { scope },
  );

  function handleDialogClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest("[data-post-dialog-surface]")) {
      return;
    }

    requestClose();
  }

  return (
    <PostDialogCloseContext.Provider value={requestClose}>
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
    </PostDialogCloseContext.Provider>
  );
}
