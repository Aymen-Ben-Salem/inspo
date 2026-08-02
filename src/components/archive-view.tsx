import type { Post, PostCategory } from "@/domain/post";

import { PostFeed } from "./post-feed";
import { SiteHeader } from "./site-header";

export function ArchiveView({
  posts,
  category,
}: {
  posts: Post[];
  category?: PostCategory;
}) {
  return (
    <main className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-white">
      <SiteHeader category={category} />
      <section
        aria-label="Design inspiration"
        className="mx-auto max-w-[1705px] px-4 pb-16 sm:px-5 2xl:px-11"
      >
        <PostFeed posts={posts} />
      </section>
    </main>
  );
}
