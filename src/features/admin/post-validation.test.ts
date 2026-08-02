import { describe, expect, it } from "vitest";

import { parseAdminPostForm } from "./post-validation";

function validForm() {
  const form = new FormData();
  form.set("slug", "example-project");
  form.set("title", "Example project");
  form.set("creatorName", "Example Studio");
  form.set("creatorHandle", "@example");
  form.set("creatorUrl", "https://example.com");
  form.set("creatorAvatarUrl", "/brand/default-avatar.png");
  form.set("description", "A concise project description.");
  form.set("category", "Branding");
  form.set("industries", "Design, Culture");
  form.set("colors", "Black, White");
  form.set("styles", "Editorial, Minimal");
  form.set("sourceUrl", "https://example.com/project");
  form.set("status", "draft");
  form.set(
    "media",
    JSON.stringify([
      {
        type: "image",
        url: "/media/growspire.png",
        posterUrl: "",
        alt: "Example artwork",
        width: 1200,
        height: 1500,
      },
    ]),
  );
  return form;
}

describe("admin post validation", () => {
  it("normalizes comma-separated tags and local media paths", () => {
    const result = parseAdminPostForm(validForm());

    expect(result.industries).toEqual(["Design", "Culture"]);
    expect(result.media[0]).toMatchObject({
      url: "/media/growspire.png",
      posterUrl: undefined,
      width: 1200,
    });
  });

  it("rejects unsafe slugs and posts without media", () => {
    const form = validForm();
    form.set("slug", "Not Safe");
    form.set("media", "[]");

    expect(() => parseAdminPostForm(form)).toThrow();
  });

  it("preserves valid managed-media ownership metadata", () => {
    const form = validForm();
    form.set(
      "media",
      JSON.stringify([
        {
          type: "video",
          url: "https://res.cloudinary.com/demo/video/upload/example.mp4",
          posterUrl: "https://res.cloudinary.com/demo/video/upload/example.jpg",
          storageProvider: "cloudinary",
          storageKey: "inspora/posts/example",
          alt: "Example motion clip",
          width: 1920,
          height: 1080,
        },
      ]),
    );

    expect(parseAdminPostForm(form).media[0]).toMatchObject({
      storageProvider: "cloudinary",
      storageKey: "inspora/posts/example",
    });
  });

  it("accepts an uploaded image without a video poster field", () => {
    const form = validForm();
    form.set(
      "media",
      JSON.stringify([
        {
          type: "image",
          url: "https://res.cloudinary.com/demo/image/upload/example.avif",
          storageProvider: "cloudinary",
          storageKey: "inspora/posts/example",
          alt: "Example artwork",
          width: 1200,
          height: 900,
        },
      ]),
    );

    const media = parseAdminPostForm(form).media[0];

    expect(media).toMatchObject({
      type: "image",
      storageProvider: "cloudinary",
    });
    expect(media?.posterUrl).toBeUndefined();
  });

  it("rejects incomplete managed-media ownership metadata", () => {
    const form = validForm();
    form.set(
      "media",
      JSON.stringify([
        {
          type: "image",
          url: "https://res.cloudinary.com/demo/image/upload/example.jpg",
          storageProvider: "cloudinary",
          alt: "Example",
          width: 1200,
          height: 900,
        },
      ]),
    );

    expect(() => parseAdminPostForm(form)).toThrow();
  });
});
