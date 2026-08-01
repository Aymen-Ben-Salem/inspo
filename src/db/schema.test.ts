import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { postMedia, posts, subscribers } from "./schema";

describe("database schema", () => {
  it("keeps the content tables normalized and constrained", () => {
    const postsConfig = getTableConfig(posts);
    const mediaConfig = getTableConfig(postMedia);

    expect(postsConfig.name).toBe("posts");
    expect(postsConfig.indexes).toHaveLength(3);
    expect(postsConfig.checks).toHaveLength(5);
    expect(mediaConfig.foreignKeys).toHaveLength(1);
    expect(mediaConfig.indexes).toHaveLength(1);
    expect(mediaConfig.checks).toHaveLength(3);
  });

  it("enforces one normalized subscriber row per email", () => {
    const subscriberConfig = getTableConfig(subscribers);

    expect(subscriberConfig.indexes).toHaveLength(1);
    expect(subscriberConfig.checks).toHaveLength(1);
  });
});
