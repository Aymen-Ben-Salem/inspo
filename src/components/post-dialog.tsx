"use client";

import { useRouter } from "next/navigation";
import { type PropsWithChildren, useCallback, useEffect } from "react";

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post details"
      className="fixed inset-0 z-50 isolate"
    >
      <button
        type="button"
        aria-label="Close post"
        onClick={close}
        className="absolute inset-0 cursor-default bg-white/10 backdrop-blur-[3px]"
      />
      <div className="pointer-events-none relative h-full">{children}</div>
    </div>
  );
}
