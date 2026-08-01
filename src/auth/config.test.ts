import { afterEach, describe, expect, it, vi } from "vitest";

import { getConfiguredAdminUserIds } from "./config";

describe("admin authentication configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not treat the example placeholder as an admin", () => {
    vi.stubEnv("ADMIN_USER_IDS", "user_REPLACE_ME");

    expect(getConfiguredAdminUserIds().size).toBe(0);
  });

  it("normalizes a comma-separated Clerk user allowlist", () => {
    vi.stubEnv("ADMIN_USER_IDS", " user_alpha,not-a-clerk-id,user_beta,user_alpha ");

    expect([...getConfiguredAdminUserIds()]).toEqual(["user_alpha", "user_beta"]);
  });
});
