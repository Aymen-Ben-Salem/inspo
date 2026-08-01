import type { AdminMediaInput } from "./types";

export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024;

export const ACCEPTED_MEDIA_MIME_TYPES = [
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export type AcceptedMediaMimeType = (typeof ACCEPTED_MEDIA_MIME_TYPES)[number];

export function getMediaUploadLimit(contentType: AcceptedMediaMimeType) {
  return contentType.startsWith("video/")
    ? MAX_VIDEO_UPLOAD_BYTES
    : MAX_IMAGE_UPLOAD_BYTES;
}

export type MediaUploadSignatureResult =
  | {
      ok: true;
      uploadUrl: string;
      parameters: Record<string, string | number>;
    }
  | { ok: false; message: string };

export type UploadedAdminMedia = Pick<
  AdminMediaInput,
  | "type"
  | "url"
  | "posterUrl"
  | "storageProvider"
  | "storageKey"
  | "alt"
  | "width"
  | "height"
>;

function defaultAltText(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function videoPosterUrl(url: string) {
  if (!url.includes("/video/upload/")) return undefined;

  return url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg/")
    .replace(/\.[a-z0-9]+$/i, ".jpg");
}

export function parseCloudinaryUploadResponse(
  value: unknown,
  fileName: string,
): UploadedAdminMedia | null {
  if (!value || typeof value !== "object") return null;

  const response = value as Record<string, unknown>;
  if (response.resource_type !== "image" && response.resource_type !== "video") {
    return null;
  }
  if (typeof response.secure_url !== "string" || typeof response.public_id !== "string") {
    return null;
  }
  if (
    typeof response.width !== "number" ||
    typeof response.height !== "number" ||
    response.width <= 0 ||
    response.height <= 0
  ) {
    return null;
  }

  try {
    if (new URL(response.secure_url).hostname !== "res.cloudinary.com") return null;
  } catch {
    return null;
  }

  return {
    type: response.resource_type,
    url: response.secure_url,
    posterUrl:
      response.resource_type === "video" ? videoPosterUrl(response.secure_url) : undefined,
    storageProvider: "cloudinary",
    storageKey: response.public_id,
    alt: defaultAltText(fileName),
    width: response.width,
    height: response.height,
  };
}
