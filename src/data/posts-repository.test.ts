import { beforeEach, describe, expect, it, vi } from "vitest";

const { cacheLife, cacheTag } = vi.hoisted(() => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ cacheLife, cacheTag }));
vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ getDatabase: () => null }));
vi.mock("@/db/schema", () => ({ postMedia: {}, posts: {} }));
vi.mock("@/domain/post", async () => import("../domain/post"));

import {
  getPostBySlug,
  getPosts,
  PUBLISHED_POSTS_CACHE_TAG,
} from "./posts-repository";

describe("published post caching", () => {
  beforeEach(() => {
    cacheLife.mockClear();
    cacheTag.mockClear();
  });

  it("assigns a bounded cache lifetime and invalidation tag", async () => {
    await getPosts();

    expect(cacheLife).toHaveBeenCalledWith({
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    });
    expect(cacheTag).toHaveBeenCalledWith(PUBLISHED_POSTS_CACHE_TAG);
  });

  it("resolves a post from the shared published collection", async () => {
    const posts = await getPosts();
    const expected = posts[0];

    expect(expected).toBeDefined();
    await expect(getPostBySlug(expected!.slug)).resolves.toEqual(expected);
  });
});
