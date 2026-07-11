"use client";

import { useRef, useState } from "react";
import { Download, ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteEventMedia,
  getAuthenticatedUserIdForStorage,
  uploadEventMedia,
  type EventMediaKind,
} from "@/lib/event-storage";
import { cn } from "@/lib/utils";

type EventMediaUploaderProps = {
  eventId: string;
  kind: EventMediaKind;
  label: string;
  description?: string;
  currentUrl?: string | null;
  accept?: string;
  onUploaded: (url: string, path?: string) => void;
  onRemoved?: () => void;
  className?: string;
  previewAspect?: "banner" | "logo" | "square" | "document";
};

const ASPECT_CLASSES = {
  banner: "aspect-[21/9]",
  logo: "aspect-square max-w-[200px]",
  square: "aspect-square",
  document: "aspect-[4/3]",
};

export default function EventMediaUploader({
  eventId,
  kind,
  label,
  description,
  currentUrl,
  accept,
  onUploaded,
  onRemoved,
  className,
  previewAspect = kind === "banner" ? "banner" : kind === "logo" ? "logo" : "square",
}: EventMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);

  const isImage = previewAspect !== "document";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const { userId, error: authError } = await getAuthenticatedUserIdForStorage();
    if (authError || !userId) {
      setError(authError?.message ?? "Not authenticated");
      setUploading(false);
      return;
    }

    const { url, path, error: uploadError } = await uploadEventMedia(
      userId,
      eventId,
      kind,
      file
    );

    setUploading(false);

    if (uploadError || !url) {
      setError(uploadError?.message ?? "Upload failed");
      return;
    }

    if (path) setStoragePath(path);
    onUploaded(url, path ?? undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove() {
    if (storagePath) {
      await deleteEventMedia(storagePath);
    }
    setStoragePath(null);
    onRemoved?.();
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  }

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-foreground">{label}</h4>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept ?? (isImage ? "image/*" : "image/*,application/pdf")}
        className="hidden"
        onChange={handleFileChange}
      />

      {currentUrl ? (
        <div className="overflow-hidden rounded-lg border">
          <div
            className={cn(
              "flex items-center justify-center bg-muted/30 p-4",
              ASPECT_CLASSES[previewAspect]
            )}
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUrl} alt={label} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <Download className="mx-auto mb-2 size-8" />
                Document uploaded
              </div>
            )}
          </div>
          <div className="flex border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="h-9 flex-1 rounded-none border-r"
            >
              <RefreshCw className={cn("size-4", uploading && "animate-spin")} />
              {uploading ? "Uploading…" : "Replace"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={handleRemove}
              className="h-9 flex-1 rounded-none text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              asChild
              className="h-9 flex-1 rounded-none border-l"
            >
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50",
            ASPECT_CLASSES[previewAspect]
          )}
        >
          {uploading ? (
            <RefreshCw className="size-6 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {uploading ? "Uploading…" : `Upload ${label}`}
          </span>
        </button>
      )}

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
