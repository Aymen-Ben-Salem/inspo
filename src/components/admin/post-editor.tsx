"use client";

import type { Route } from "next";
import Link from "next/link";
import { useActionState, useState } from "react";

import { POST_CATEGORIES } from "@/domain/post";
import {
  initialAdminActionState,
  type AdminActionState,
  type AdminMediaInput,
  type AdminPostRecord,
} from "@/features/admin/types";

type MediaDraft = Omit<AdminMediaInput, "width" | "height"> & {
  width: number | string;
  height: number | string;
};

const inputClass =
  "focus-ring h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition-colors placeholder:text-[#aaa] focus:border-black/30";
const labelClass = "grid gap-2 text-sm font-medium text-[#333]";

function blankMedia(): MediaDraft {
  return {
    type: "image",
    url: "",
    posterUrl: "",
    alt: "",
    width: 1200,
    height: 1500,
  };
}

export function PostEditor({
  action,
  post,
}: {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  post?: AdminPostRecord;
}) {
  const [state, formAction, isPending] = useActionState(action, initialAdminActionState);
  const [media, setMedia] = useState<MediaDraft[]>(
    post?.media.length ? post.media : [blankMedia()],
  );

  function updateMedia(index: number, field: keyof MediaDraft, value: string) {
    setMedia((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  return (
    <form action={formAction} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <input type="hidden" name="media" value={JSON.stringify(media)} />

      <div className="grid gap-6">
        {state.status === "error" ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        {post?.status === "archived" ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This post is archived. Saving it as a draft or publishing it will restore it.
          </p>
        ) : null}

        <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#888]">Content</p>
            <h2 className="mt-1 text-xl font-medium tracking-[-0.03em]">Post details</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              Title
              <input className={inputClass} name="title" required maxLength={200} defaultValue={post?.title} />
            </label>
            <label className={labelClass}>
              Slug
              <input
                className={inputClass}
                name="slug"
                required
                maxLength={120}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="project-name"
                defaultValue={post?.slug}
              />
            </label>
            <label className={labelClass}>
              Category
              <select className={inputClass} name="category" defaultValue={post?.category ?? "Branding"}>
                {POST_CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Description
              <textarea
                className="focus-ring min-h-32 w-full resize-y rounded-xl border border-black/10 bg-white p-3 text-sm outline-none transition-colors focus:border-black/30"
                name="description"
                required
                maxLength={4000}
                defaultValue={post?.description}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Original project URL
              <input className={inputClass} name="sourceUrl" type="url" required defaultValue={post?.sourceUrl} />
            </label>
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#888]">Attribution</p>
            <h2 className="mt-1 text-xl font-medium tracking-[-0.03em]">Creator</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Creator name
              <input className={inputClass} name="creatorName" required defaultValue={post?.creatorName} />
            </label>
            <label className={labelClass}>
              Handle
              <input className={inputClass} name="creatorHandle" placeholder="@studio" defaultValue={post?.creatorHandle} />
            </label>
            <label className={labelClass}>
              Creator URL
              <input className={inputClass} name="creatorUrl" type="url" defaultValue={post?.creatorUrl} />
            </label>
            <label className={labelClass}>
              Avatar URL or local path
              <input
                className={inputClass}
                name="creatorAvatarUrl"
                required
                placeholder="/brand/default-avatar.png"
                defaultValue={post?.creatorAvatarUrl ?? "/brand/default-avatar.png"}
              />
            </label>
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#888]">Gallery</p>
              <h2 className="mt-1 text-xl font-medium tracking-[-0.03em]">Media</h2>
            </div>
            <button
              type="button"
              onClick={() => setMedia((current) => [...current, blankMedia()])}
              className="focus-ring rounded-full border border-black/10 px-4 py-2 text-sm transition-colors hover:bg-[#f3f3f3]"
            >
              Add media
            </button>
          </div>
          <p className="text-sm leading-relaxed text-[#777]">
            Use local paths or image/video URLs from a hostname configured in Next.js. The first item is the feed cover.
          </p>
          <div className="grid gap-4">
            {media.map((item, index) => (
              <div key={index} className="grid gap-4 rounded-xl bg-[#f5f5f2] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Media {index + 1}</span>
                  <button
                    type="button"
                    disabled={media.length === 1}
                    onClick={() => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="text-xs text-[#777] underline-offset-4 hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Type
                    <select
                      className={inputClass}
                      value={item.type}
                      onChange={(event) => updateMedia(index, "type", event.target.value)}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Media URL or local path
                    <input
                      className={inputClass}
                      required
                      value={item.url}
                      onChange={(event) => updateMedia(index, "url", event.target.value)}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Poster URL or local path
                    <input
                      className={inputClass}
                      value={item.posterUrl ?? ""}
                      onChange={(event) => updateMedia(index, "posterUrl", event.target.value)}
                    />
                  </label>
                  <label className={`${labelClass} sm:col-span-2`}>
                    Alt text
                    <input
                      className={inputClass}
                      maxLength={500}
                      value={item.alt}
                      onChange={(event) => updateMedia(index, "alt", event.target.value)}
                    />
                  </label>
                  <label className={labelClass}>
                    Width
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      max={12000}
                      value={item.width}
                      onChange={(event) => updateMedia(index, "width", event.target.value)}
                    />
                  </label>
                  <label className={labelClass}>
                    Height
                    <input
                      className={inputClass}
                      type="number"
                      min={1}
                      max={12000}
                      value={item.height}
                      onChange={(event) => updateMedia(index, "height", event.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="grid content-start gap-5 xl:sticky xl:top-24 xl:self-start">
        <section className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#888]">Classification</p>
            <h2 className="mt-1 text-xl font-medium tracking-[-0.03em]">Tags</h2>
          </div>
          <label className={labelClass}>
            Industries
            <input className={inputClass} name="industries" placeholder="Design, Culture" defaultValue={post?.industries.join(", ")} />
          </label>
          <label className={labelClass}>
            Colors
            <input className={inputClass} name="colors" placeholder="Black, Cyan" defaultValue={post?.colors.join(", ")} />
          </label>
          <label className={labelClass}>
            Styles
            <input className={inputClass} name="styles" placeholder="Bold, Editorial" defaultValue={post?.styles.join(", ")} />
          </label>
        </section>

        <section className="grid gap-3 rounded-2xl border border-black/10 bg-white p-5">
          <button
            type="submit"
            name="status"
            value="published"
            disabled={isPending}
            className="focus-ring h-11 rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#252525] disabled:cursor-wait disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save and publish"}
          </button>
          <button
            type="submit"
            name="status"
            value="draft"
            disabled={isPending}
            className="focus-ring h-11 rounded-full border border-black/10 px-5 text-sm font-medium transition-colors hover:bg-[#f3f3f3] disabled:cursor-wait disabled:opacity-50"
          >
            Save draft
          </button>
          <Link href={"/admin/posts" as Route} className="focus-ring py-2 text-center text-sm text-[#777] hover:text-black">
            Cancel
          </Link>
        </section>
      </aside>
    </form>
  );
}
