"use server";

import { z } from "zod";

import { requireAdmin } from "@/auth/require-admin";
import {
  createCloudinaryUploadSignature,
  MediaStorageConfigurationError,
} from "@/storage/cloudinary";

import {
  ACCEPTED_MEDIA_MIME_TYPES,
  MAX_MEDIA_UPLOAD_BYTES,
  type MediaUploadSignatureResult,
} from "./media-upload";

const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(ACCEPTED_MEDIA_MIME_TYPES),
  size: z.number().int().positive().max(MAX_MEDIA_UPLOAD_BYTES),
});

export async function createMediaUploadSignatureAction(
  input: unknown,
): Promise<MediaUploadSignatureResult> {
  await requireAdmin();

  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Choose a supported image, GIF, or video no larger than 100 MB.",
    };
  }

  try {
    return { ok: true, ...createCloudinaryUploadSignature() };
  } catch (error) {
    if (error instanceof MediaStorageConfigurationError) {
      return { ok: false, message: error.message };
    }

    console.error("Media upload signing failed", error);
    return { ok: false, message: "The upload could not be prepared. Try again." };
  }
}
