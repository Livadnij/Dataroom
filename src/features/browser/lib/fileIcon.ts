import {
  FileIcon,
  FileImageIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileTypeIcon,
  FileJsonIcon,
  FileCodeIcon,
  FileTextIcon,
} from "lucide-react";

const CODE_LIKE_TYPES = new Set([
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/xml",
  "text/xml",
]);

export function getFileIcon(mimeType: string): typeof FileIcon {
  if (mimeType === "application/pdf") return FileTypeIcon;
  if (mimeType.startsWith("image/")) return FileImageIcon;
  if (mimeType.startsWith("video/")) return FileVideoIcon;
  if (mimeType.startsWith("audio/")) return FileAudioIcon;
  if (mimeType === "application/json") return FileJsonIcon;
  if (CODE_LIKE_TYPES.has(mimeType)) return FileCodeIcon;
  if (mimeType.startsWith("text/")) return FileTextIcon;
  return FileIcon;
}
