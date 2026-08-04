import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfPreviewProps {
  url: string;
}

export function PdfPreview({ url }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setPageNumber(1);
    setError(false);

    const loadingTask = getDocument({ url });
    loadingTask.promise
      .then((loaded) => {
        if (!cancelled) setDoc(loaded);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
    };
  }, [url]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!doc || availableWidth === 0) return;
    let cancelled = false;

    async function render() {
      const page = await doc!.getPage(pageNumber);
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const unscaled = page.getViewport({ scale: 1 });
      const maxHeight = (window.innerHeight * 70) / 100;
      const scale = Math.min(
        availableWidth / unscaled.width,
        maxHeight / unscaled.height,
      );
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
    }

    render().catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, availableWidth]);

  if (error) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        This PDF couldn't be rendered.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col items-center gap-3 p-4"
    >
      {!doc ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <canvas ref={canvasRef} />
          {doc.numPages > 1 && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((n) => n - 1)}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {pageNumber} of {doc.numPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                disabled={pageNumber >= doc.numPages}
                onClick={() => setPageNumber((n) => n + 1)}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
