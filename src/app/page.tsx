import { getPosts } from "@/data/posts-repository";
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
  const allPosts = await getPosts();
  const posts = category
    ? allPosts.filter((post) => post.category === category)
    : allPosts;

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
