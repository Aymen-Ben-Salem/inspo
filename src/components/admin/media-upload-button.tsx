"use client";

import { useRef, useState } from "react";

import { createMediaUploadSignatureAction } from "@/features/admin/media-actions";
import {
  ACCEPTED_MEDIA_MIME_TYPES,
  MAX_MEDIA_UPLOAD_BYTES,
  parseCloudinaryUploadResponse,
  type UploadedAdminMedia,
} from "@/features/admin/media-upload";

type UploadStatus = "idle" | "signing" | "uploading";

export function MediaUploadButton({
  onUploaded,
}: {
  onUploaded: (media: UploadedAdminMedia) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");
  const isPending = status !== "idle";

  async function upload(file: File) {
    setError("");

    if (
      !ACCEPTED_MEDIA_MIME_TYPES.some((contentType) => contentType === file.type) ||
      file.size > MAX_MEDIA_UPLOAD_BYTES
    ) {
      setError("Choose a supported image, GIF, or video no larger than 100 MB.");
      return;
    }

    try {
      setStatus("signing");
      const signature = await createMediaUploadSignatureAction({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });

      if (!signature.ok) throw new Error(signature.message);

      const formData = new FormData();
      for (const [key, value] of Object.entries(signature.parameters)) {
        formData.set(key, String(value));
      }
      formData.set("file", file);

      setStatus("uploading");
      const response = await fetch(signature.uploadUrl, { method: "POST", body: formData });
      const payload = (await response.json()) as {
        error?: { message?: string };
        [key: string]: unknown;
      };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Cloudinary rejected the upload.");
      }

      const media = parseCloudinaryUploadResponse(payload, file.name);
      if (!media) throw new Error("Cloudinary returned incomplete media information.");

      onUploaded(media);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The file could not be uploaded.");
    } finally {
      setStatus("idle");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid justify-items-start gap-2">
      <label
        className={`focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 inline-flex h-9 cursor-pointer items-center rounded-full border border-black/10 bg-white px-3 text-xs font-medium transition-colors hover:bg-[#efefec] ${isPending ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/avif,image/gif,image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          disabled={isPending}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        {status === "signing"
          ? "Preparing..."
          : status === "uploading"
            ? "Uploading..."
            : "Upload file"}
      </label>
      {error ? (
        <p role="alert" className="max-w-sm text-xs leading-relaxed text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
