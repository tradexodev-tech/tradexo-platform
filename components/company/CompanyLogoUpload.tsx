"use client";

import { useRef, useState } from "react";
import { Building2, ImagePlus, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type CompanyLogoUploadProps = {
  logoUrl: string | null;
  userId: string;
  onLogoChange: (url: string | null) => void;
};

export default function CompanyLogoUpload({
  logoUrl,
  userId,
  onLogoChange,
}: CompanyLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be smaller than 2 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
    onLogoChange(data.publicUrl);
    setUploading(false);
  }

  function handleRemove() {
    onLogoChange(null);
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Company Logo</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your logo appears on your company profile and marketplace listings.
            PNG, JPG, or WebP up to 2 MB.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex w-full flex-col gap-4 sm:w-auto lg:min-w-72">
          {logoUrl ? (
            <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
              <div className="flex aspect-[4/3] items-center justify-center bg-muted/40 p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Company logo preview"
                  className="max-h-32 max-w-full object-contain"
                />
              </div>
              <div className="flex border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                  className="h-10 flex-1 rounded-none border-r"
                >
                  <RefreshCw className="size-4" />
                  {uploading ? "Uploading..." : "Change"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={handleRemove}
                  className="h-10 flex-1 rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50 sm:w-72"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                {uploading ? (
                  <RefreshCw className="size-6 animate-spin text-muted-foreground" />
                ) : (
                  <ImagePlus className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {uploading ? "Uploading logo..." : "Upload company logo"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click to browse or drag a file here
                </p>
              </div>
            </button>
          )}

          {!logoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="w-full"
            >
              <Building2 className="size-4" />
              {uploading ? "Uploading..." : "Choose Image"}
            </Button>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
