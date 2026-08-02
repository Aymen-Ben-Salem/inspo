import { ArchiveView } from "@/components/archive-view";
import { getPosts } from "@/data/posts-repository";
import { isPostCategory } from "@/domain/post";

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

  return <ArchiveView posts={posts} category={category} />;
}
