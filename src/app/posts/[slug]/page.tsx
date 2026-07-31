import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailHeader } from "@/components/detail-header";
import { PostGallery } from "@/components/post-gallery";
import { PostMetadata } from "@/components/post-metadata";
import { seedPosts } from "@/data/seed-posts";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seedPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = seedPosts.find((candidate) => candidate.slug === slug);

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
  const post = seedPosts.find((candidate) => candidate.slug === slug);

  if (!post) notFound();

  return (
    <main className="flex min-h-[100dvh] w-full max-w-full flex-col overflow-x-hidden bg-white">
      <DetailHeader />
      <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100dvh-61px)] lg:flex-row lg:overflow-hidden">
        <PostMetadata post={post} />
        <PostGallery post={post} />
      </div>
    </main>
  );
}
