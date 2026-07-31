import { seedPosts } from "@/data/seed-posts";
import { isPostCategory } from "@/domain/post";
import { PostFeed } from "@/components/post-feed";
import { SiteHeader } from "@/components/site-header";

type HomeProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { category: categoryParam } = await searchParams;
  const rawCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const category = rawCategory && isPostCategory(rawCategory) ? rawCategory : undefined;
  const posts = category
    ? seedPosts.filter((post) => post.category === category)
    : seedPosts;

  return (
    <main className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-white">
      <SiteHeader category={category} />
      <section aria-label="Design inspiration" className="px-3 pb-16 pt-5 sm:px-5">
        <PostFeed posts={posts} />
      </section>
    </main>
  );
}
