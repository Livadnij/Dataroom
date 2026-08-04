export type PreviewTier =
  | "pdf"
  | "image"
  | "text"
  | "video"
  | "audio"
  | "unsupported";

const TEXT_LIKE_TYPES = new Set([
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/xml",
  "text/xml",
]);

export function getPreviewTier(mimeType: string): PreviewTier {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("text/") || TEXT_LIKE_TYPES.has(mimeType))
    return "text";
  return "unsupported";
}
