import { UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { isAdminAccessConfigured } from "@/auth/config";
import { requireAdmin } from "@/auth/require-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!isAdminAccessConfigured()) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f5f2] px-5">
        <section className="w-full max-w-xl rounded-2xl border border-black/10 bg-white p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.16em] text-[#777]">Admin setup</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em]">
            Connect Clerk to unlock the admin.
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-[#666]">
            Add the Clerk publishable key, secret key, and at least one allowlisted Clerk user
            ID to your environment. Public pages remain available while admin access is disabled.
          </p>
          <div className="mt-6 rounded-xl bg-[#f5f5f2] p-4 font-mono text-xs leading-6 text-[#444]">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            <br />
            CLERK_SECRET_KEY
            <br />
            ADMIN_USER_IDS
          </div>
        </section>
      </main>
    );
  }

  await requireAdmin();

  return (
    <div className="min-h-[100dvh] bg-[#f5f5f2] text-[#171717]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f5f5f2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-5 sm:px-8">
          <Link href={"/admin/posts" as Route} className="focus-ring text-lg font-medium tracking-[-0.04em]">
            Inspora admin
          </Link>
          <nav className="flex items-center gap-1 text-sm text-[#666]" aria-label="Admin">
            <Link
              href={"/admin/posts" as Route}
              className="focus-ring rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black"
            >
              Posts
            </Link>
            <Link
              href={"/admin/subscribers" as Route}
              className="focus-ring rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-black"
            >
              Subscribers
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="focus-ring hidden rounded-full border border-black/10 bg-white px-4 py-2 text-sm sm:inline-flex"
            >
              View site
            </Link>
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
