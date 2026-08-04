import { lazy, Suspense, useEffect, useState } from "react";
import { DownloadIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFileBlob } from "../api/useBrowser";
import { getPreviewTier } from "../lib/previewTier";
import { downloadFile } from "../lib/downloadFile";
import type { FileNode } from "@/types/entities";

const PdfPreview = lazy(() =>
  import("./PdfPreview").then((m) => ({ default: m.PdfPreview })),
);

interface FilePreviewDialogProps {
  file: FileNode | null;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({
  file,
  onOpenChange,
}: FilePreviewDialogProps) {
  const { data: blob } = useFileBlob(file?.id ?? null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textError, setTextError] = useState(false);

  const tier = file ? getPreviewTier(file.mimeType) : "unsupported";

  useEffect(() => {
    if (!blob) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  useEffect(() => {
    if (!blob || tier !== "text") {
      setTextContent(null);
      setTextError(false);
      return;
    }
    let cancelled = false;
    setTextError(false);
    blob
      .text()
      .then((text) => {
        if (!cancelled) setTextContent(text);
      })
      .catch(() => {
        if (!cancelled) setTextError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [blob, tier]);

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[80vh] flex-col sm:max-w-3xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="pr-20 text-left">
          <DialogTitle className="truncate">{file?.name}</DialogTitle>
        </DialogHeader>
        {file && (
          <button
            type="button"
            onClick={() => downloadFile(file.id, file.name)}
            aria-label={`Download ${file.name}`}
            className="absolute right-12 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <DownloadIcon />
          </button>
        )}
        <div className="flex items-center justify-center overflow-hidden bg-muted/30">
          {!objectUrl ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : tier === "pdf" ? (
            <Suspense
              fallback={
                <p className="p-6 text-sm text-muted-foreground">Loading…</p>
              }
            >
              <PdfPreview url={objectUrl} />
            </Suspense>
          ) : tier === "image" ? (
            <img
              src={objectUrl}
              alt={file?.name}
              className="max-h-[70vh] max-w-full object-contain"
            />
          ) : tier === "text" ? (
            textError ? (
              <p className="p-6 text-sm text-muted-foreground">
                This file couldn't be read for preview.
              </p>
            ) : textContent === null ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : (
              <pre className="max-h-[70vh] w-full overflow-auto whitespace-pre-wrap break-words p-4 text-left font-mono text-xs">
                {textContent}
              </pre>
            )
          ) : tier === "video" ? (
            <video
              src={objectUrl}
              controls
              className="max-h-[70vh] max-w-full object-contain"
            />
          ) : tier === "audio" ? (
            <audio src={objectUrl} controls className="w-full" />
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              Preview isn't available for this file type. Use the download
              button above to save it instead.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
