"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  type PostDialogCloseMode,
  usePostDialogClose,
} from "./post-dialog";

export function PostCloseButton({
  closeMode,
  children,
}: {
  closeMode: PostDialogCloseMode;
  children: ReactNode;
}) {
  const router = useRouter();
  const closeDialog = usePostDialogClose();

  function close() {
    if (closeDialog) {
      closeDialog();
      return;
    }

    if (closeMode === "back") {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button
      type="button"
      aria-label="Close post"
      onClick={close}
      className="focus-ring flex size-10 items-center justify-center rounded-full border border-[#e6e6e6] bg-[#e6e6e6] text-[#95959d] transition-colors hover:bg-[#dcdcdc] hover:text-[#505050]"
    >
      {children}
    </button>
  );
}
