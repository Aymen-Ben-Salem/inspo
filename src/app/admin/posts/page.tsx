import type { Route } from "next";
import Link from "next/link";

import { ConfirmButton } from "@/components/admin/confirm-button";
import { archivePostAction, deletePostAction } from "@/features/admin/actions";
import { getAdminPosts } from "@/features/admin/posts-repository";

const statusStyles = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-[#e5e5e5] text-[#666]",
} as const;

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <div className="grid gap-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#777]">Content</p>
          <h1 className="mt-1 text-4xl font-medium tracking-[-0.05em]">Posts</h1>
          <p className="mt-2 text-sm text-[#777]">{posts.length} total posts</p>
        </div>
        <Link
          href={"/admin/posts/new" as Route}
          className="focus-ring inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#252525]"
        >
          New post
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center text-[#777]">No posts yet.</div>
        ) : (
          <div className="divide-y divide-black/10">
            {posts.map((post) => (
              <article
                key={post.id}
                className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-medium tracking-[-0.025em]">{post.title}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusStyles[post.status]}`}>
                      {post.status}
                    </span>
                    <span className="rounded-full bg-[#f1f1ef] px-2.5 py-1 text-[11px] text-[#666]">
                      {post.category}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#777]">
                    /posts/{post.slug} · Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(post.updatedAt))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/posts/${post.id}/edit` as Route}
                    className="focus-ring rounded-full border border-black/10 px-4 py-2 text-sm transition-colors hover:bg-[#f3f3f3]"
                  >
                    Edit
                  </Link>
                  {post.status !== "archived" ? (
                    <form action={archivePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <ConfirmButton
                        confirmation={`Archive “${post.title}”? It will disappear from the public site.`}
                        className="focus-ring rounded-full border border-black/10 px-4 py-2 text-sm text-[#666] transition-colors hover:bg-[#f3f3f3] hover:text-black"
                      >
                        Archive
                      </ConfirmButton>
                    </form>
                  ) : (
                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <ConfirmButton
                        confirmation={`Permanently delete “${post.title}” and all of its media records? This cannot be undone.`}
                        className="focus-ring rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
                      >
                        Delete permanently
                      </ConfirmButton>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
