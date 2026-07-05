"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export type CompanyDocument = {
  name: string;
  url: string;
  uploaded_at: string;
};

type CompanyDocumentsProps = {
  documents: CompanyDocument[];
  userId: string;
  onDocumentsChange: (documents: CompanyDocument[]) => void;
};

export default function CompanyDocuments({
  documents,
  userId,
  onDocumentsChange,
}: CompanyDocumentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setError(null);
    setUploading(true);

    const uploaded: CompanyDocument[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds the 10 MB limit.`);
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${userId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("company-documents")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { data } = supabase.storage
        .from("company-documents")
        .getPublicUrl(path);

      uploaded.push({
        name: file.name,
        url: data.publicUrl,
        uploaded_at: new Date().toISOString(),
      });
    }

    if (uploaded.length > 0) {
      onDocumentsChange([...documents, ...uploaded]);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(index: number) {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Company Documents</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload certificates, licenses, or trade documents. PDF or images up to 10 MB
        each.
      </p>

      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "Uploading..." : "Upload Documents"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {documents.length > 0 && (
        <ul className="mt-4 space-y-2">
          {documents.map((doc, index) => (
            <li
              key={`${doc.url}-${index}`}
              className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm text-blue-600 hover:underline"
              >
                {doc.name}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${doc.name}`}
              >
                <Trash2 className="size-3.5 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
