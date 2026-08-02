import type { ReactNode } from "react";

import { PostDialog } from "@/components/post-dialog";

export default function InterceptedPostLayout({ children }: { children: ReactNode }) {
  return <PostDialog closeMode="back">{children}</PostDialog>;
}
