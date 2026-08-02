"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import type { PostDialogCloseMode } from "./post-dialog";

export function PostCloseButton({
  closeMode,
  children,
}: {
  closeMode: PostDialogCloseMode;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Close post"
      onClick={() => (closeMode === "back" ? router.back() : router.push("/"))}
      className="focus-ring flex size-10 items-center justify-center rounded-full border border-[#e6e6e6] bg-[#e6e6e6] text-[#95959d] transition-colors hover:bg-[#dcdcdc] hover:text-[#505050]"
    >
      {children}
    </button>
  );
}
