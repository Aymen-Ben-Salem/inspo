"use server";

import { z } from "zod";

import { requireAdmin } from "@/auth/require-admin";
import {
  createCloudinaryUploadSignature,
  MediaStorageConfigurationError,
} from "@/storage/cloudinary";

import {
  ACCEPTED_MEDIA_MIME_TYPES,
  getMediaUploadLimit,
  isAcceptedUploadForKind,
  MAX_VIDEO_UPLOAD_BYTES,
  type MediaUploadKind,
  type MediaUploadSignatureResult,
} from "./media-upload";

const uploadRequestSchema = z.object({
  kind: z.enum(["post-media", "creator-avatar"] satisfies MediaUploadKind[]),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(ACCEPTED_MEDIA_MIME_TYPES),
  size: z.number().int().positive().max(MAX_VIDEO_UPLOAD_BYTES),
});

export async function createMediaUploadSignatureAction(
  input: unknown,
): Promise<MediaUploadSignatureResult> {
  await requireAdmin();

  const parsed = uploadRequestSchema.safeParse(input);
  if (
    !parsed.success ||
    !isAcceptedUploadForKind(parsed.data.kind, parsed.data.contentType) ||
    parsed.data.size > getMediaUploadLimit(parsed.data.contentType)
  ) {
    return {
      ok: false,
      message:
        parsed.success && parsed.data.kind === "creator-avatar"
          ? "Creator avatars must be images up to 10 MB."
          : "Images and GIFs can be up to 10 MB; videos up to 100 MB.",
    };
  }

  try {
    return { ok: true, ...createCloudinaryUploadSignature(parsed.data.kind) };
  } catch (error) {
    if (error instanceof MediaStorageConfigurationError) {
      return { ok: false, message: error.message };
    }

    console.error("Media upload signing failed", error);
    return { ok: false, message: "The upload could not be prepared. Try again." };
  }
}
