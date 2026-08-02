"use client";

import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  type PropsWithChildren,
  useCallback,
  useEffect,
} from "react";

export type PostDialogCloseMode = "back" | "home";

export function PostDialog({
  children,
  closeMode,
}: PropsWithChildren<{ closeMode: PostDialogCloseMode }>) {
  const router = useRouter();

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

  function handleDialogClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest("[data-post-dialog-surface]")) {
      return;
    }

    close();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post details"
      onClick={handleDialogClick}
      className="fixed inset-0 z-50 isolate"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-white/10 backdrop-blur-[3px]" />
      <div className="pointer-events-none relative h-full">{children}</div>
    </div>
  );
}
