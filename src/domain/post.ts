export const POST_CATEGORIES = [
  "Web",
  "Branding",
  "Product",
  "Motion",
  "Illustration",
  "3D",
  "Print",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
export type MediaType = "image" | "video";

export type PostMedia = {
  id: string;
  type: MediaType;
  url: string;
  posterUrl?: string;
  alt: string;
  width: number;
  height: number;
  position: number;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  creatorName: string;
  creatorHandle?: string;
  creatorUrl?: string;
  creatorAvatarUrl: string;
  description: string;
  category: PostCategory;
  industries: string[];
  colors: string[];
  styles: string[];
  sourceUrl: string;
  publishedAt: string;
  media: PostMedia[];
};

export function isPostCategory(value: string): value is PostCategory {
  return POST_CATEGORIES.some((category) => category === value);
}

export function isGifUrl(value: string) {
  try {
    return new URL(value, "https://inspora.local").pathname.toLowerCase().endsWith(".gif");
  } catch {
    return false;
  }
}
