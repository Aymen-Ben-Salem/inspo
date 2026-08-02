import { describe, expect, it } from "vitest";

import {
  optimizeCloudinaryAnimatedImageUrl,
  optimizeCloudinaryPosterUrl,
  optimizeCloudinaryVideoUrl,
} from "./cloudinary-delivery";

describe("Cloudinary delivery optimization", () => {
  it("adds automatic format and quality to animated images", () => {
    expect(
      optimizeCloudinaryAnimatedImageUrl(
        "https://res.cloudinary.com/inspora/image/upload/v1/inspora/posts/loop.gif",
      ),
    ).toBe(
      "https://res.cloudinary.com/inspora/image/upload/q_auto/f_auto/v1/inspora/posts/loop.gif",
    );
  });

  it("adds automatic format and quality to videos", () => {
    expect(
      optimizeCloudinaryVideoUrl(
        "https://res.cloudinary.com/inspora/video/upload/v1/inspora/posts/demo.mp4",
      ),
    ).toBe(
      "https://res.cloudinary.com/inspora/video/upload/q_auto/f_auto/v1/inspora/posts/demo.mp4",
    );
  });

  it("optimizes generated video posters without forcing JPEG delivery", () => {
    expect(
      optimizeCloudinaryPosterUrl(
        "https://res.cloudinary.com/inspora/video/upload/so_0,f_jpg/v1/inspora/posts/demo.jpg",
      ),
    ).toBe(
      "https://res.cloudinary.com/inspora/video/upload/so_0/q_auto/f_auto/v1/inspora/posts/demo.jpg",
    );
  });

  it("does not duplicate an existing optimization", () => {
    const url =
      "https://res.cloudinary.com/inspora/video/upload/q_auto/f_auto/v1/inspora/posts/demo.mp4";

    expect(optimizeCloudinaryVideoUrl(url)).toBe(url);
  });

  it("leaves non-Cloudinary URLs unchanged", () => {
    const url = "https://media.example.com/posts/demo.mp4";

    expect(optimizeCloudinaryVideoUrl(url)).toBe(url);
    expect(optimizeCloudinaryAnimatedImageUrl(url)).toBe(url);
    expect(optimizeCloudinaryPosterUrl(url)).toBe(url);
  });
});
