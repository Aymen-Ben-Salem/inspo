import type { Route } from "next";
import Link from "next/link";

import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminMediaPreview } from "@/components/admin/media-preview";
import { archivePostAction, deletePostAction } from "@/features/admin/actions";
import { getAdminPosts } from "@/features/admin/posts-repository";

const statusStyles = {
  published: "bg-[#dcebdd] text-[#315f37]",
  draft: "bg-[#f3e9ce] text-[#795d18]",
  archived: "bg-[#e7e7e4] text-[#696965]",
} as const;

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();
  const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  const statusCounts = posts.reduce(
    (counts, post) => ({ ...counts, [post.status]: counts[post.status] + 1 }),
    { published: 0, draft: 0, archived: 0 },
  );

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 pb-7">
        <div className="max-w-5xl">
          <h1 className="text-4xl font-medium tracking-[-0.055em] sm:text-5xl">Posts</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#777]">
            <span>{posts.length} total</span>
            <span>{statusCounts.published} published</span>
            <span>{statusCounts.draft} drafts</span>
            {statusCounts.archived ? <span>{statusCounts.archived} archived</span> : null}
          </div>
        </div>
        <Link
          href={"/admin/posts/new" as Route}
          className="focus-ring inline-flex h-11 items-center rounded-full bg-black px-5 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#252525]"
        >
          New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white px-6 py-20 text-center">
          <p className="text-lg font-medium tracking-[-0.02em]">No posts yet.</p>
          <p className="mt-2 text-sm text-[#777]">Create the first entry in your inspiration archive.</p>
        </div>
      ) : (
        <section
          aria-label="Post library"
          className="grid grid-flow-dense gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2 xl:grid-cols-3"
        >
          {posts.map((post) => {
            const cover = post.media[0];

            return (
              <article key={post.id} className="group flex min-w-0 flex-col bg-white">
                <Link
                  href={`/admin/posts/${post.id}/edit` as Route}
                  aria-label={`Edit ${post.title}`}
                  className="focus-ring relative block aspect-[4/3] overflow-hidden bg-[#ececea]"
                >
                  <AdminMediaPreview
                    type={cover?.type ?? "image"}
                    url={cover?.url ?? ""}
                    posterUrl={cover?.posterUrl}
                    alt={cover?.alt || `${post.title} cover`}
                    className="size-full"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {post.media.length > 1 ? (
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                      {post.media.length} media
                    </span>
                  ) : null}
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-medium tracking-[-0.035em]">{post.title}</h2>
                      <p className="mt-1 truncate text-sm text-[#777]">
                        by {post.creator.name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${statusStyles[post.status]}`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#777]">
                    <span>{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Updated {dateFormatter.format(new Date(post.updatedAt))}</span>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                    <Link
                      href={`/admin/posts/${post.id}/edit` as Route}
                      className="focus-ring rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#252525]"
                    >
                      Edit
                    </Link>
                    {post.status === "published" ? (
                      <Link
                        href={`/posts/${post.slug}` as Route}
                        target="_blank"
                        className="focus-ring rounded-full border border-black/10 px-4 py-2 text-sm transition-colors hover:bg-[#f3f3f1]"
                      >
                        View live
                      </Link>
                    ) : null}
                    <div className="ml-auto">
                      {post.status !== "archived" ? (
                        <form action={archivePostAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <ConfirmButton
                            confirmation={`Archive “${post.title}”? It will disappear from the public site.`}
                            className="focus-ring px-2 py-2 text-xs text-[#777] underline-offset-4 hover:text-black hover:underline"
                          >
                            Archive
                          </ConfirmButton>
                        </form>
                      ) : (
                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <ConfirmButton
                            confirmation={`Permanently delete “${post.title}” and all of its media records? This cannot be undone.`}
                            className="focus-ring px-2 py-2 text-xs text-red-700 underline-offset-4 hover:underline"
                          >
                            Delete permanently
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
