import { notFound } from "next/navigation";

import { PostDetail } from "@/components/post-detail";
import { PostDialog } from "@/components/post-dialog";
import { getPostBySlug, getPosts } from "@/data/posts-repository";

type PostModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PostModalPage({ params }: PostModalPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const posts = await getPosts();
  const currentIndex = posts.findIndex((candidate) => candidate.id === post.id);
  const previousPost = posts[(currentIndex - 1 + posts.length) % posts.length] ?? post;
  const nextPost = posts[(currentIndex + 1) % posts.length] ?? post;

  return (
    <PostDialog closeMode="back" postId={post.id}>
      <PostDetail
        post={post}
        previousPost={previousPost}
        nextPost={nextPost}
        closeMode="back"
      />
    </PostDialog>
  );
}
