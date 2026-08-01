import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostGallery } from "@/components/post-gallery";
import { PostMetadata } from "@/components/post-metadata";
import {
  getPostBySlug,
  getPosts,
  getPublishedSlugs,
} from "@/data/posts-repository";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  const cover = post.media[0];

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: cover ? [{ url: cover.url, width: cover.width, height: cover.height, alt: cover.alt }] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const posts = await getPosts();
  const currentIndex = posts.findIndex((candidate) => candidate.id === post.id);
  const previousPost = posts[(currentIndex - 1 + posts.length) % posts.length] ?? post;
  const nextPost = posts[(currentIndex + 1) % posts.length] ?? post;

  return (
    <main className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-hidden bg-[#262626] lg:h-[100dvh] lg:flex-row lg:overflow-hidden">
      <PostGallery post={post} />
      <PostMetadata post={post} previousPost={previousPost} nextPost={nextPost} />
    </main>
  );
}
