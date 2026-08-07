import { describe, expect, it } from "vitest";

import type { Post } from "@/domain/post";

import {
  decodePostCursor,
  encodePostCursor,
  paginatePostArray,
} from "./post-pagination";

function makePost(
  id: string,
  publishedAt: string,
  category: Post["category"],
  {
    createdAt = publishedAt,
    isFeatured = false,
  }: { createdAt?: string; isFeatured?: boolean } = {},
): Post {
  return {
    id,
    slug: `post-${id}`,
    title: `Post ${id}`,
    creator: {
      id: `creator-${id}`,
      name: `Creator ${id}`,
      avatarUrl: "/brand/default-avatar.svg",
    },
    description: "Description",
    category,
    industries: [],
    colors: [],
    styles: [],
    sourceUrl: "https://example.com",
    createdAt,
    publishedAt,
    isFeatured,
    media: [],
  };
}

const posts = [
  makePost("b", "2026-08-07T12:00:00.000Z", "Web", { isFeatured: true }),
  makePost("a", "2026-08-07T12:00:00.000Z", "Branding"),
  makePost("c", "2026-08-06T12:00:00.000Z", "Web", { isFeatured: true }),
];

describe("post cursor pagination", () => {
  it("round-trips an opaque cursor", () => {
    const value = {
      createdAt: "2026-08-07T12:00:00.000Z",
      id: "post-id",
    };

    expect(decodePostCursor(encodePostCursor(value))).toEqual(value);
  });

  it("rejects malformed cursor values", () => {
    expect(decodePostCursor("not-a-cursor")).toBeNull();
    expect(decodePostCursor(encodePostCursor({ createdAt: "invalid", id: "x" }))).toBeNull();
  });

  it("returns stable pages when publication timestamps match", () => {
    const first = paginatePostArray(posts, { limit: 2 });
    const second = paginatePostArray(posts, {
      cursor: first.nextCursor,
      limit: 2,
    });

    expect(first.items.map((post) => post.id)).toEqual(["b", "a"]);
    expect(first.nextCursor).not.toBeNull();
    expect(second.items.map((post) => post.id)).toEqual(["c"]);
    expect(second.nextCursor).toBeNull();
  });

  it("filters before paginating", () => {
    const page = paginatePostArray(posts, { category: "Web", limit: 1 });
    const nextPage = paginatePostArray(posts, {
      category: "Web",
      cursor: page.nextCursor,
      limit: 1,
    });

    expect(page.items.map((post) => post.id)).toEqual(["b"]);
    expect(nextPage.items.map((post) => post.id)).toEqual(["c"]);
    expect(nextPage.nextCursor).toBeNull();
  });

  it("orders Latest by original creation time rather than publication time", () => {
    const page = paginatePostArray(
      [
        makePost("older", "2026-08-07T12:00:00.000Z", "Web", {
          createdAt: "2026-08-01T12:00:00.000Z",
        }),
        makePost("newer", "2026-08-06T12:00:00.000Z", "Web", {
          createdAt: "2026-08-05T12:00:00.000Z",
        }),
      ],
      { view: "latest" },
    );

    expect(page.items.map((post) => post.id)).toEqual(["newer", "older"]);
  });

  it("returns only admin-featured posts in the Featured view", () => {
    const page = paginatePostArray(posts, { view: "featured" });

    expect(page.items.map((post) => post.id)).toEqual(["b", "c"]);
  });
});
