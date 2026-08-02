import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getClerkAuthorizedParties, isClerkConfigured } from "@/auth/config";

const authorizedParties = getClerkAuthorizedParties();
const withClerk = clerkMiddleware(
  authorizedParties.length > 0 ? { authorizedParties } : undefined,
);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) return NextResponse.next();

  return withClerk(request, event);
}

export const config = {
  matcher: [
    // Let Clerk complete session handshakes on every application page while
    // excluding framework internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
