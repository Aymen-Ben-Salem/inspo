import { ClerkProvider } from "@clerk/nextjs";
import { Suspense, type PropsWithChildren } from "react";

import { isClerkConfigured } from "@/auth/config";

export function AuthProvider({ children }: PropsWithChildren) {
  if (!isClerkConfigured()) return children;

  return (
    <Suspense
      fallback={
        <div
          aria-label="Loading authentication"
          className="min-h-[100dvh] bg-[#f5f5f2]"
        />
      }
    >
      <ClerkProvider dynamic>{children}</ClerkProvider>
    </Suspense>
  );
}
