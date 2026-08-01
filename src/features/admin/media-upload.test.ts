import { describe, expect, it } from "vitest";

import { parseCloudinaryUploadResponse } from "./media-upload";

describe("Cloudinary upload responses", () => {
  it("maps an uploaded image to managed media", () => {
    expect(
      parseCloudinaryUploadResponse(
        {
          resource_type: "image",
          secure_url: "https://res.cloudinary.com/inspora/image/upload/v1/inspora/posts/cover.gif",
          public_id: "inspora/posts/cover",
          width: 1200,
          height: 900,
        },
        "animated-cover.gif",
      ),
    ).toEqual({
      type: "image",
      url: "https://res.cloudinary.com/inspora/image/upload/v1/inspora/posts/cover.gif",
      posterUrl: undefined,
      storageProvider: "cloudinary",
      storageKey: "inspora/posts/cover",
      alt: "animated cover",
      width: 1200,
      height: 900,
    });
  });

  it("creates a first-frame poster for uploaded video", () => {
    const media = parseCloudinaryUploadResponse(
      {
        resource_type: "video",
        secure_url: "https://res.cloudinary.com/inspora/video/upload/v1/inspora/posts/demo.mp4",
        public_id: "inspora/posts/demo",
        width: 1920,
        height: 1080,
      },
      "demo-reel.mp4",
    );

    expect(media?.posterUrl).toBe(
      "https://res.cloudinary.com/inspora/video/upload/so_0,f_jpg/v1/inspora/posts/demo.jpg",
    );
  });

  it("rejects incomplete or untrusted responses", () => {
    expect(
      parseCloudinaryUploadResponse(
        {
          resource_type: "image",
          secure_url: "https://example.com/not-cloudinary.jpg",
          public_id: "example",
          width: 100,
          height: 100,
        },
        "example.jpg",
      ),
    ).toBeNull();
  });
});
