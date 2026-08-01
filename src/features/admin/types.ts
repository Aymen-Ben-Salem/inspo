import type { MediaType, PostCategory } from "@/domain/post";

export type AdminPostStatus = "draft" | "published" | "archived";

export type AdminMediaInput = {
  type: MediaType;
  url: string;
  posterUrl?: string;
  alt: string;
  width: number;
  height: number;
};

export type AdminPostInput = {
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
  status: Exclude<AdminPostStatus, "archived">;
  media: AdminMediaInput[];
};

export type AdminPostRecord = Omit<AdminPostInput, "status"> & {
  id: string;
  status: AdminPostStatus;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminActionState = {
  status: "idle" | "error";
  message?: string;
};

export const initialAdminActionState: AdminActionState = { status: "idle" };
