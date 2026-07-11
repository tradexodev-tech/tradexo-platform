import { supabase } from "@/lib/supabase";
import type { EventDocumentCategory } from "@/types/event";

export const EVENT_MEDIA_BUCKET = "event-media";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOCUMENT_TYPES = ["application/pdf", ...IMAGE_TYPES];

export type EventMediaKind = "banner" | "logo" | "gallery" | EventDocumentCategory;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildStoragePath(
  userId: string,
  eventId: string,
  kind: EventMediaKind,
  fileName: string
) {
  const safeName = sanitizeFileName(fileName);
  return `${userId}/${eventId}/${kind}/${Date.now()}-${safeName}`;
}

export function getEventMediaPublicUrl(path: string) {
  const { data } = supabase.storage.from(EVENT_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadEventMedia(
  userId: string,
  eventId: string,
  kind: EventMediaKind,
  file: File
): Promise<{ url: string | null; path: string | null; error: { message: string } | null }> {
  const isDocument = kind !== "banner" && kind !== "logo" && kind !== "gallery";
  const allowedTypes = isDocument ? DOCUMENT_TYPES : IMAGE_TYPES;
  const maxSize = isDocument ? MAX_DOCUMENT_SIZE : MAX_IMAGE_SIZE;

  if (!allowedTypes.includes(file.type)) {
    return {
      url: null,
      path: null,
      error: { message: "File type is not supported for this upload." },
    };
  }

  if (file.size > maxSize) {
    return {
      url: null,
      path: null,
      error: {
        message: `File exceeds the ${isDocument ? "10 MB" : "5 MB"} limit.`,
      },
    };
  }

  const path = buildStoragePath(userId, eventId, kind, file.name);

  const { error: uploadError } = await supabase.storage
    .from(EVENT_MEDIA_BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { url: null, path: null, error: { message: uploadError.message } };
  }

  return { url: getEventMediaPublicUrl(path), path, error: null };
}

export async function deleteEventMedia(
  path: string
): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase.storage.from(EVENT_MEDIA_BUCKET).remove([path]);
  return { error: error ? { message: error.message } : null };
}

export async function getAuthenticatedUserIdForStorage() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { userId: null, error: error ?? { message: "User not authenticated" } };
  }

  return { userId: user.id, error: null };
}
