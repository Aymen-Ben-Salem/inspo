import { ClerkProvider } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";

import { isClerkConfigured } from "@/auth/config";

export function AuthProvider({ children }: PropsWithChildren) {
  if (!isClerkConfigured()) return children;

  return <ClerkProvider>{children}</ClerkProvider>;
}
